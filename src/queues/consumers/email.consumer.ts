import { Service } from 'typedi';
import { Channel, Connection, connect } from 'amqplib';
import { env } from '../../config/env.config';
import { logger } from '../../utils/logger';
import { EmailMessage } from '../queue.types';
import { sendChildAstrologySuccessEmail, sendPoojaSuccessEmail, sendPoojaFailedEmail } from '../../utils/emailService';

@Service()
export class EmailConsumer {
    private channel: Channel = null!;
    private connection: Connection = null!;
    private readonly queueName = 'send-email';

    async initialize(): Promise<void> {
        try {
            this.connection = await connect(env.rabbitmq.url);
            this.channel = await this.connection.createChannel();
            await this.channel.assertQueue(this.queueName);

            this.channel.consume(this.queueName, this.processMessage.bind(this));
            logger.info('Email consumer initialized');
        } catch (error) {
            // logger.error('Failed to initialize email consumer: ', error);
            console.log('Failed to initialize email consumer: ', error);
            throw error;
        }
    }

    private async processMessage(msg: any): Promise<void> {
        if (!msg) return;

        try {
            logger.info('Processing message', JSON.parse(msg.content));
            const emailMessage: EmailMessage = JSON.parse(msg.content.toString());
            // Process email message here
            if (emailMessage.type === 'child-astrology-success') {
                await sendChildAstrologySuccessEmail(emailMessage);
            } else if (emailMessage.type === 'pooja-success') {
                await sendPoojaSuccessEmail(emailMessage);
            } else if (emailMessage.type === 'pooja-failed') {
                await sendPoojaFailedEmail(emailMessage);
            }
            logger.info('Processing email message', emailMessage);

            this.channel.ack(msg);
        } catch (error) {
            console.log('Error processing message: ', error);
            logger.error('Error processing message', error);
            this.channel.nack(msg);
        }
    }
}
  