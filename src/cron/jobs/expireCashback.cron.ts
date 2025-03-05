import { Service } from 'typedi';
import { logger } from '../../utils/logger';
import Transaction from '../../models/transaction.model';
import User from '../../models/user.model';
import { Op } from 'sequelize';
import moment from 'moment';

export const ExpireCashback = {
  // schedule: "0 0 0 * * *", // Run daily at 6:00 AM
  schedule: '*/5 * * * *',
  name: 'expireCashback',

  async execute(): Promise<void> {
    logger.info('Running expireCashback cron job');
    
    try {
      const currentDate = moment().format('YYYY-MM-DD');
      const expiredCashbackTransactions = await Transaction.findAll({
        where: {
          recharge_type: 'CASHBACK',
          available_balance: { [Op.gt]: 0 },
          expiry_date: { [Op.lt]: currentDate },
          title: 'Cashback offer',
        },
      });
      
      logger.info(`Expired Transactions count: ${expiredCashbackTransactions.length}`);
      
      for (const transaction of expiredCashbackTransactions) {
        const { user_id, available_balance, id, txnid, requestId, channelId, calltype, user_phone } = transaction;
        const currentTransaction = await Transaction.findOne({ where: { id } });
        const user = await User.findOne({ where: { id: user_id } });

        if (user) {
          const actualDeductedAmount = Math.min(Number(available_balance), Number(user.wallet));
          user.wallet = String(Number(user.wallet) - actualDeductedAmount);
          await user.save();
          
          const expiredTransaction = new Transaction({
            txnid,
            requestId,
            status: 'success',
            user_id,
            user_phone,
            user_type: 'user',
            calltype,
            channelId,
            ammount: available_balance,
            txn_type: 'debit',
            txn_by: 'admin',
            title: 'Cashback expiry',
          });
          await expiredTransaction.save();
        }
        if(currentTransaction){
            currentTransaction.available_balance = 0;
            await currentTransaction.save();
        }
      }
      
      logger.info('Expire cashback cron job completed successfully');
    } catch (error) {
      logger.error('Error expiring cashback:', error);
    }
  }
}
