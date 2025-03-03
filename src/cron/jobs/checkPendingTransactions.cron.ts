import { CronJob } from './base.cron';
import { logger } from '../../utils/logger';
import Transaction from '../../models/transaction.model'; // Adjust the import based on your project structure
import { Op } from 'sequelize';
import moment from 'moment';
import updateTransaction from '../../utils/updateTransaction';

const checkPendingTransactions = async (): Promise<void> => {
  try {
    const twoMinutesAgo: Date = moment().subtract(2, 'minutes').toDate();
    const fiveMinutesAgo: Date = moment().subtract(5, 'minutes').toDate();
    const pendingTransactions: Transaction[] = await Transaction.findAll({
      where: {
        status: 'pending',
        paymentmode: 'phonepe',
        createdAt: {
          [Op.between]: [fiveMinutesAgo, twoMinutesAgo],
        },
      },
    });

    console.log(`Found ${pendingTransactions.length} pending transactions.`);

    for (const txn of pendingTransactions) {
      console.log(`Processing Transaction ID: ${txn.requestId}`);

      try {
        await updateTransaction(txn.requestId); // Ensure updateTransaction is defined and imported
        console.log(`Updated Transaction ID: ${txn.requestId}`);
      } catch (error) {
        console.error(
          `Error processing Transaction ID: ${txn.requestId}:`,
          (error as Error).message // Type assertion for error
        );
      }
    }
  } catch (error) {
    console.error("Error in payment cron job:", (error as Error).message); // Type assertion for error
  }
};

export const checkPendingTransactionsJob: CronJob = {
    schedule: '*/10 * * * * *',
    name: 'endAbandonedLivestreamCalls',
    execute: async () => {
      logger.info('Running Pending Txns cron job');
      await checkPendingTransactions();
    }
  };