import amqp, { Connection, Channel, Options } from "amqplib";
import { env } from '../../config/env.config';

const RABBITMQ_URL = env.rabbitmq.url;


export async function removeWaitlistQueue(task: any, delay: number): Promise<void> {
  try {
    if (!task.astroId) {
      throw new Error("Task must have an 'astroId'");
    }

    const QUEUE_NAME = `scheduled_task_queue_${task.astroId}`; // Main processing queue
    const DELAY_QUEUE = `waitlist_delay_queue_${task.astroId}`; // Delayed queue

    const connection: Connection = await amqp.connect(RABBITMQ_URL);
    const channel: Channel = await connection.createChannel();

    // Declare the main processing queue
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Declare the delay queue with Dead Letter Exchange (DLX)
    await channel.assertQueue(DELAY_QUEUE, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "", // Moves expired messages to main queue
        "x-dead-letter-routing-key": QUEUE_NAME, // Route to main queue
        "x-message-ttl": delay, // Delay in milliseconds
      },
    });

    // Send task to delay queue
    const messageOptions: Options.Publish = { persistent: true };
    await channel.sendToQueue(DELAY_QUEUE, Buffer.from(JSON.stringify(task)), messageOptions);

    console.log(`✅ Task scheduled: ${task.name} in ${delay}ms`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("❌ Error in removeWaitlistQueue:", error);
  }
}
