import { Service } from 'typedi';
import { BaseCron } from './base.cron';
import { logger } from '../utils/logger';
import Transaction from '../models/transaction.model';
import User from '../models/user.model';
import { Op } from 'sequelize';
import moment from 'moment';

@Service()
export class ExpirePromoCashback extends BaseCron {
  protected schedule = '0 5 * * *'; // Run daily at 5:00 AM
  protected name = 'expirePromoCashback';

  async execute(): Promise<void> {
    logger.info('Running expirePromoCashback cron job');
    
    try {
      const currentDate = moment().format('YYYY-MM-DD');
      const formatDate = `${currentDate} 05:30:00.000`;
      logger.info(`Current Date for expiry: ${formatDate}`);
      
      const expiredCashbackTransactions = await Transaction.findAll({
        where: {
          recharge_type: 'CASHBACK',
          available_balance: { [Op.gt]: 0 },
          expiry_date: formatDate,
          title: {
            [Op.in]: [
              'Amount Deposited d1',
              'Amount Deposited d7',
              'Amount Deposited',
            ],
          },
        },
      });
      
      logger.info(`Expiring ${expiredCashbackTransactions.length} cashback transactions`);
      
      for (const transaction of expiredCashbackTransactions) {
        const { user_id, available_balance, id, txnid, requestId, channelId, calltype, user_phone } = transaction;
        const currentTransaction = await Transaction.findOne({ where: { id } });
        const user = await User.findByPk(user_id);

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
            title: 'Promotional Cashback expiry',
          });
          await expiredTransaction.save();
        }
        if(currentTransaction){
            currentTransaction.available_balance = 0;
            await currentTransaction.save();
        }
      }
      
      logger.info('Expire promotional cashback cron job completed successfully');
    } catch (error) {
      logger.error('Error expiring promotional cashback:', error);
    }
  }
}
