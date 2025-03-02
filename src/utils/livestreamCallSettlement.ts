import crypto from 'crypto';
import { Op } from 'sequelize';
import Astrologer from '../models/astrologer.model';
import User from '../models/user.model';
import Commision from '../models/commision.model';
import Transaction from '../models/transaction.model';
import LivestreamCall from '../models/livestreamCall.model';
import sendUserDebitMsg from './sendUserDebitMsg';

async function livestreamCallSettlement(livestreamCallId: number): Promise<boolean> {
  const call = await LivestreamCall.findByPk(livestreamCallId);
  if (!call || Number(call.call_duration) <= 0) return false;

  const callStart = new Date(call.start_time).getTime();
  if (callStart < 1695666600) return false;

  const transactionExist = await Transaction.findOne({
    where: {
      channelId: `${livestreamCallId}`,
      txn_type: 'debit',
      user_type: 'user',
      user_id: call.user_id,
      calltype: 'livestream_call',
    },
  });
  if (transactionExist) return false;

  const astrologer = await Astrologer.findByPk(call.astro_id);
  const user = await User.findByPk(call.user_id);
  if (!astrologer || !user || Number(user.wallet) < Number(call.per_min_price)) {
    console.log('WALLET BALANCE LESS THAN 1 MIN CHAT', livestreamCallId, user?.id);
    return false;
  }

  const totalCharge = Math.ceil(Number(call.per_min_price) * Number(call.call_duration));
  const actualDeductedAmount = Math.min(totalCharge, Number(user.wallet));
  const astroCommission = Math.ceil(Number(call.astro_commission_per_min) * Number(call.call_duration));
  let adminCommission = actualDeductedAmount - astroCommission;
  if (adminCommission < 0) adminCommission = 0;

  if (actualDeductedAmount > 0) {
    let adjustableAmt = actualDeductedAmount;
    const todayDate = new Date();
    const cashbackTransactions = await Transaction.findAll({
      where: {
        user_type: 'user',
        user_id: call.user_id,
        recharge_type: 'CASHBACK',
        txn_type: 'credit',
        available_balance: { [Op.gt]: 0 },
        expiry_date: { [Op.gte]: todayDate },
      },
      order: [['expiry_date', 'ASC']],
    });

    for (const cbTransaction of cashbackTransactions) {
      if (adjustableAmt <= 0) break;
      const deduction = Math.min(cbTransaction.available_balance, adjustableAmt);
      cbTransaction.available_balance -= deduction;
      adjustableAmt -= deduction;
      await cbTransaction.save();
    }
  }

  user.wallet = Math.max(Number(user.wallet) - actualDeductedAmount, 0).toString();
  await user.save();
  astrologer.wallet = (Number(astrologer.wallet) + Number(astroCommission));
  await astrologer.save();

  await Transaction.create({
    txnid: `${crypto.randomUUID()}-${Date.now()}`,
    requestId: `${crypto.randomUUID()}-${Date.now()}`,
    status: 'success',
    user_id: user.id,
    user_phone: user.phone,
    user_type: 'user',
    calltype: 'Livestream Call',
    channelId: call.id,
    ammount: actualDeductedAmount.toString(),
    txn_type: 'debit',
    txn_by: 'admin',
    title: `Livestream Call with ${astrologer.display_name}`,
  });

  await Transaction.create({
    txnid: `${crypto.randomUUID()}-${Date.now()}`,
    requestId: `${crypto.randomUUID()}-${Date.now()}`,
    status: 'success',
    user_id: astrologer.id,
    user_phone: astrologer.phone,
    user_type: 'astro',
    calltype: 'Livestream Call',
    channelId: call.id,
    ammount: astroCommission.toString(),
    txn_type: 'credit',
    txn_by: 'admin',
    title: `Livestream Call with ${user.user_name}`,
  });

  await Commision.create({
    ammount: totalCharge,
    astro_amount: astroCommission,
    astro_id: astrologer.id,
    commission_amount: adminCommission,
    commission: call.astro_commission_per_min,
    channel_id: call.id,
  });

  if (Number(user.wallet) >= 0 && actualDeductedAmount > 0) {
    await sendUserDebitMsg(user.phone, actualDeductedAmount, Number(user.wallet));
  }

  return true;
}

export default livestreamCallSettlement;
