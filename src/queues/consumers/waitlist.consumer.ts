import { Service } from 'typedi';
import { Channel, Connection, connect } from 'amqplib';
import { env } from '../../config/env.config';
import { logger } from '../../utils/logger';
import { WaitlistMessage } from '../queue.types';
import sendNotification from '../../utils/sendNotification';
import updateWaitlist from '../../utils/updateWaitlist';
import redisClient from '../../config/redis.config';
import UserCall from '../../models/userCall.model';
import User from '../../models/user.model';
import UserFcmToken from '../../models/userFcmToken.model';
import Astrologer from '../../models/astrologer.model';
import AstroNotification from '../../models/astroNotification.model';
import callSettlement from '../../utils/callSettlement';
import { ApiError } from '../../middlewares/error.middleware';

import moment from 'moment';
import util from 'util';
import { UUID } from 'crypto';

const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);

@Service()
export class WaitlistConsumer {
    private channel: Channel = null!;
    private connection: Connection = null!;

    async initialize(): Promise<void> {
        try {
            this.connection = await connect(env.rabbitmq.url);
            this.channel = await this.connection.createChannel();

            const astrologers = await Astrologer.findAll({
                where: { is_delete: false, status: true, is_verified: true }
            });
            for (const astro of astrologers) {
                await this.setupAstrologerQueue(astro.astro_id);
            }

            logger.info('Waitlist consumer initialized');
        } catch (error) {
            logger.error('Failed to initialize waitlist consumer: ', error);
            throw error;
        }
    }

    private async setupAstrologerQueue(astroId: UUID): Promise<void> {
        const delayExchange = `waitlist_delay_queue_${astroId}`;
        const queueName = `scheduled_task_queue_${astroId}`;

        // Using TTL + Dead Letter Exchange instead of x-delayed-message
        await this.channel.assertExchange(delayExchange, 'direct', { durable: true });

        await this.channel.assertQueue(queueName, {
            durable: true,
            arguments: {
                'x-message-ttl': 180000, // 3-minute delay
                'x-dead-letter-exchange': delayExchange // Forward expired messages
            }
        });

        await this.channel.bindQueue(queueName, delayExchange, queueName);

        this.channel.consume(queueName, async (msg) => {
            if (!msg) return;
            try {
                const waitlistMessage: WaitlistMessage = JSON.parse(msg.content.toString());
                logger.info(`Processing waitlist message for astrologer ${astroId}`, waitlistMessage);
                await this.processWaitlist(waitlistMessage);
                this.channel.ack(msg);
            } catch (error) {
                logger.error('Error processing waitlist message', error);
                this.channel.nack(msg);
            }
        });

        logger.info(`Listening to queue: ${queueName}`);
    }

    private async processWaitlist(waitlistMessage: any): Promise<void> {
        if (!waitlistMessage) return;
        try {    
            const { astroId, userId, channelId, callType } = waitlistMessage;
            const user = await User.findByPk(userId);
            const astrologer = await Astrologer.findByPk(astroId);
            let call: UserCall | null = null;
            if (callType === 'chat') {
                call = await UserCall.findOne({ where: { channelId: channelId } });
              } else if (callType === 'call') {
                call = await UserCall.findOne({ where: { id: channelId } });
              }
            if (!user || !astrologer || !call) {
                logger.warn('User, Astrologer, or call not found');
                return;
            }
            logger.info(`Removing user ${userId} from astrologer ${astroId} waitlist`);
            const status = 'waitlist_removal';
            if(call.call_status == 'waiting'){
                await disconnectChat(call, user, astrologer, status)
            }else if(call && call.call_status == 'initiated' && call.user_status == 'waiting' ){
                let endTime = new Date().toISOString();
                let startTime = moment(call.startTime).toISOString();
                let callDuration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60);
                if(callDuration <= 1){
                    await disconnectChat(call, user, astrologer, status)
                }else{
                    await endChat(call, user, astrologer, status)
                }
            }else{
                throw new ApiError('Automatic waitlist removal throws error', 200);
            }
            const endNotification = {
                notification_type: 'waitlist_expired',
                firebaseChId: call.firebaseChId,
                channelId: call.channelId,
                title: 'LifeGuru',
                body: 'Your waitlist turn has expired. Please try again later.',
            };
            await sendNotification(user.device_token, endNotification);
            // this.channel.ack(waitlistMessage);
        } catch (error) {
            // console.log('Error processing message', error);
            logger.error('Error processing message', error);
            // this.channel.nack(waitlistMessage);
        }
    }
}


    const delay = (ms: number): Promise<void> => {
        return new Promise<void>((resolve) => {
            setTimeout(resolve, ms);
        });
    };

    const disconnectChat = async (call: UserCall, user: User, astrologer: Astrologer, status: string): Promise<void> =>{
        try {
            logger.info("inside disconnect chat fun");
            const endTime = new Date().toISOString();
            
            // Update call status
            call.reason = call.call_status;
            call.status = status;
            call.call_status = 'ended';
            call.user_status = status;
            call.endTime = endTime;
            call.holdDuration = 0;
            call.callDuration = 0;
            await call.save();
            
            await updateWaitlist(call, astrologer, status);

            await AstroNotification.create({
                user_id: call.userId,
                astro_id: call.astroId,
                user_call_id: call.id,
                is_read: false,
                status: 'user_left_waitlist',
                call_type: call.callType,
            });

            const endNotification = {
                notification_type: status,
                firebaseChId: call.firebaseChId,
                channelId: call.channelId,
                title: 'LifeGuru',
                body: `A user has left the ${call.callType} waitlist`
            };

            await UserFcmToken.create({
                user_id: user.id,
                astro_id: astrologer.id,
                firebaseChannelId: call.firebaseChId,
                channelId: call.channelId,
                status: status
            });

            await sendNotification(astrologer.devicetoken, endNotification);

            const currentKey = `astro_${astrologer?.astro_id}`;
            try {
                const deleteResult = redisDelAsync(currentKey);
                logger.info(`Deleted Redis key: ${currentKey}`);
            } catch (err) {
                logger.error(`Error deleting key ${currentKey}:`, err);
            }
            logger.info(`Chat disconnected for call ${call.id}`);
        } catch (error) {
            console.log("disconnect chat error log: ", error);
            logger.error('Error in disconnectChat:', error);
            throw error;
        }
    }
    const endChat = async(call: any, user: User, astrologer: Astrologer, status: string): Promise<void> => {
        try {
            let endTime : string | undefined = new Date().toISOString();

            let callDuration = Math.ceil(
                (new Date(endTime).getTime() - new Date(call.startTime).getTime()) / 1000 / 60
            );
            
            if ((call.call_status === 'initiated' && call.astro_status === 'waiting') || 
                call.user_status === 'waiting') {
                callDuration = 0;
            }
            // Update call status
            call.reason = call.call_status;
            call.endTime = new Date(endTime);
            call.callDuration = callDuration;
            call.status = status;
            call.call_status = 'ended';
            call.user_status = 'end_user';
            await call.save();

            logger.info("CSU_END >>>", call.id, call.reason, call.status, call.call_status, call.user_status);

            const endNotification = {
                notification_type: status,
                firebaseChId: call.firebaseChId,
                channel_id: call.channelId,
                title: 'LifeGuru',
                body: 'Chat has been ended by user',
            };

            await UserFcmToken.create({
                user_id: user.id,
                astro_id: astrologer.id,
                firebaseChannelId: call.firebaseChId,
                channelId: call.channelId,
                status: status
            });

            await callSettlement(call.channelId);
            await updateWaitlist(call, astrologer, status);
            await delay(200);
            await sendNotification(astrologer.devicetoken, endNotification);

            const keyToDelete = `astro_${astrologer.astro_id}`;
            try {
                const deleteResult = redisDelAsync(keyToDelete);
                logger.info(`Deleted Redis key: ${keyToDelete}`);
              } catch (err) {
                logger.error(`Error deleting key ${keyToDelete}:`, err);
              }

            logger.info(`Chat ended for call ${call.id}`);
        } catch (error) {
            console.log("end chat error log: ", error);
            logger.error('Error in endChat:', error);
            throw error;
        }
    }
