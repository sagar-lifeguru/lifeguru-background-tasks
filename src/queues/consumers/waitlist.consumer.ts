import { Service } from 'typedi';
import { Channel, Connection, connect } from 'amqplib';
import { env } from '../../config/env.config';
import { logger } from '../../utils/logger';
import { WaitlistMessage } from '../queue.types';
import HoldCall from '../../models/holdCall.model';
import UserFcmToken from '../../models/userFcmToken.model';
import AstroNotifications from '../../models/astroNotification.model';  
import sendNotification  from '../../utils/sendNotification';
import callSettlement from '../../utils/callSettlement';
import updateWaitlist from '../../utils/updateWaitlist';
import util from 'util';
import redisClient from '../../config/redis.config';

//using util.promisify to make client.del return a promise. This will ensure proper async handling.
const redisDelAsync = util.promisify(redisClient.del).bind(redisClient);

const delay = (ms: number): Promise<void> => {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
    });
};
@Service()
export class WaitlistConsumer {
    private channel: Channel = null!;
    private connection: Connection = null!;
    private readonly queueName = 'scheduled_task_queue';

    async initialize(): Promise<void> {
        try {
            this.connection = await connect(env.rabbitmq.url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName);

            this.channel.consume(this.queueName, this.processMessage.bind(this));
            logger.info('Waitlist consumer initialized');
        } catch (error) {
            logger.error('Failed to initialize waitlist consumer: ', error);
            throw error;
        }
    }

    private async processMessage(msg: any): Promise<void> {
        if (!msg) return;

        try {
            logger.info('Processing waitlist message', JSON.parse(msg.content));
            const waitlistMessage: WaitlistMessage = JSON.parse(msg.content.toString());
            
            if (waitlistMessage.status === 'disconnect_user') {
                const { call, user, astrologer } = waitlistMessage;
                
                if (call.call_status === 'waiting') {
                    await this.disconnectChat(call, user, astrologer, waitlistMessage.status);
                } else if (call.call_status === 'initiated' && call.user_status === 'waiting') {
                    const endTime = new Date().toISOString();
                    const callDuration = Math.floor(
                        (new Date(endTime).getTime() - new Date(call.startTime).getTime()) / 1000 / 60
                    );
                    
                    if (callDuration <= 1) {
                        // await this.disconnectChat(call, user, astrologer, waitlistMessage.status);
                    } else {
                        await this.endChat(call, user, astrologer, waitlistMessage.status);
                    }
                } else {
                    throw new Error('Not able to end');
                }
            }
            
            logger.info('Processed waitlist message', waitlistMessage);
            this.channel.ack(msg);
        } catch (error) {
            logger.error('Error processing waitlist message', error);
            this.channel.nack(msg);
        }
    }

    private async disconnectChat(call: any, user: any, astrologer: any, status: string): Promise<void> {
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

            await AstroNotifications.create({
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

            const keyToDelete = `${astrologer.astro_id}`;
            try {
                await redisDelAsync(keyToDelete);
                logger.info(`Deleted Redis key: ${keyToDelete}`);
              } catch (err) {
                logger.error(`Error deleting key ${keyToDelete}:`, err);
              }

            logger.info(`Chat disconnected for call ${call.id}`);
        } catch (error) {
            logger.error('Error in disconnectChat:', error);
            throw error;
        }
    }

    private async endChat(call: any, user: any, astrologer: any, status: string): Promise<void> {
        try {
            let endTime : string | undefined = new Date().toISOString();

            // if (call.status === 'hold') {
            //     const holdCall = await HoldCall.findOne({ 
            //         where: { channelId: call.channelId, status: 'pending' } 
            //     });
            //     endTime = holdCall?.startTime;
            // }

            let callDuration = Math.ceil(
                (new Date(endTime).getTime() - new Date(call.startTime).getTime()) / 1000 / 60
            );
            
            let holdDuration = 0;
            const holdTime = await HoldCall.sum('holdDuration', { 
                where: { channelId: call.channelId, status: 'complete' } 
            });
            holdDuration = holdTime || 0;
            logger.info('hold time user status update', holdTime);
            callDuration = callDuration - holdTime;

            if ((call.call_status === 'initiated' && call.astro_status === 'waiting') || 
                call.user_status === 'waiting') {
                callDuration = 0;
                holdDuration = 0;
            }

            // Update call status
            call.reason = call.call_status;
            call.endTime = endTime;
            call.holdDuration = holdDuration;
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

            const keyToDelete = `${astrologer.astro_id}`;
            try {
                await redisDelAsync(keyToDelete);
                logger.info(`Deleted Redis key: ${keyToDelete}`);
              } catch (err) {
                logger.error(`Error deleting key ${keyToDelete}:`, err);
              }

            logger.info(`Chat ended for call ${call.id}`);
        } catch (error) {
            logger.error('Error in endChat:', error);
            throw error;
        }
    }
}
