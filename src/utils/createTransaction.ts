import Transaction from '../models/transaction.model';

const createTransaction = async (
  txzId: string,
  userId: number,
  userPhone: string,
  userType: string,
  channelId: string | null,
  amt_with_GST: number,
  status: string,
  txnType: string,
  txnBy: string,
  title: string,
  paymentMode: string,
  expiry_date?: Date | string,
  recharge_type?: string,
  available_balance?: number
): Promise<boolean> => {
  try {
    const txn = new Transaction({
      requestId: txzId,
      user_id: userId,
      user_phone: userPhone,
      user_type: userType,
      channelId: channelId || "",
      ammount: amt_with_GST,
      status: status,
      txn_type: txnType,
      txn_by: txnBy,
      title: title,
      paymentmode: paymentMode
    });
    if (expiry_date) txn.expiry_date = new Date(expiry_date);
    if (recharge_type) txn.recharge_type = recharge_type;
    if (available_balance) txn.available_balance = available_balance;
    await txn.save();
    return true;
  } catch (error) {
    console.log("Error: ", error);
    return false;
  }
}

export default createTransaction; 