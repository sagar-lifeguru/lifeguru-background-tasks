import User from '../models/user.model';
import Astrologer from '../models/astrologer.model';
import UserCall from '../models/userCall.model';
import Transaction from '../models/transaction.model';
import Offer from '../models/offer.model';
import PriceSlab from '../models/priceSlab.model';
import Slab from '../models/slab.model';
import ChatSummary from '../models/chatSummary.model';
import {ApiError}  from '../middlewares/error.middleware';
import sendRechargeMsg from './sendRechargeMsg';
import createTransaction from './createTransaction';
import moment from 'moment';
import { Op } from 'sequelize';
import crypto from 'crypto';
import axios from 'axios';
import sendWhatsAppRechargeMsg from './sendWhatsAppRechargeMsg';
import calculateConsultPrice from './calculateConsultPrice';
import fetchChatSummary from './fetchChatSummary';

const getTransactionInfo = async (transactionId: string): Promise<any> => {
  const merchantId = process.env.MERCHANT_ID!;
  const saltKey = process.env.SALT_KEY!;
  const saltIndex = process.env.SALT_INDEX!;

  const verifyString = '/pg/v1/status' + `/${merchantId}` + `/${transactionId}` + saltKey;
  const verifyHash = crypto.createHash('sha256').update(verifyString).digest('hex');
  const verifyFinalHash = verifyHash + "###" + saltIndex;

  const verifyPaymentOptions = {
    method: 'GET',
    url: `${process.env.CHECK_STATUS_PROD}/pg/v1/status/${merchantId}/${transactionId}`,
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': verifyFinalHash,
      'X-MERCHANT-ID': merchantId
    }
  };

  const result = await axios.request(verifyPaymentOptions);
  if (!result?.data) {
    throw new ApiError("Something went wrong while initiating payment", 200);
  }
  result.data.data.amount = Math.round(result.data.data.amount / 100);
  return result.data;
}

const updateUserWallet = async (txn: Transaction, result: any): Promise<number> => {
  const amountXGST = Math.round(Number(result.data?.amount) / 1.18);
  const user = await User.findOne({ where: { phone: txn.user_phone } });
  if(!user) throw new ApiError("User not found for this mobile number", 200);
  const cashBackTransaction = await Transaction.findOne({
    where: {
      title: 'Cashback offer',
      txn_type: "credit",
      status: "success",
      user_id: txn.user_id,
      requestId: txn.requestId,
    },
  });

  if (cashBackTransaction) return (parseInt(String(cashBackTransaction?.ammount)) + parseInt(String(amountXGST)));
  let cashbackAmount = await findValidCashback(amountXGST, txn);

  if (cashbackAmount && cashbackAmount > amountXGST) {
    const extraBalance = cashbackAmount - amountXGST;
    const futureExpiryDate = moment().add(3, 'months').format("YYYY-MM-DD");

    const isTransactionCreated = await createTransaction(txn.requestId, txn.user_id, txn.user_phone, "user", txn.channelId, extraBalance, 'success', "credit", 'Lifeguru', 'Cashback offer', txn.paymentmode, futureExpiryDate, 'CASHBACK', extraBalance);
    if (!isTransactionCreated) throw new ApiError('Initiate payment could not be saved in transaction table', 200);

    await updateMaxMinute(txn, user, cashbackAmount);
    const newBalance = parseInt(user.wallet) + cashbackAmount;
    user.wallet = String(newBalance);
    await user.save();
    await sendRechargeMsg(user.phone, cashbackAmount, newBalance);
    await sendWhatsAppRechargeMsg(user.phone, cashbackAmount, newBalance);
    return cashbackAmount;
  } else {
    await updateMaxMinute(txn, user, amountXGST);
    const newBalance = parseInt(user.wallet) + amountXGST;
    user.wallet = String(newBalance);
    await user.save();

    await sendRechargeMsg(user.phone, amountXGST, newBalance);
    await sendWhatsAppRechargeMsg(user.phone, amountXGST, newBalance);
    return amountXGST;
  }
}

const updateTransaction = async (transactionId: string, callApi: boolean = true, receivedJson?: any): Promise<any> => {
  console.log('UPDATE TRANSACTION >>>', transactionId);
  try {
    let result: any = {};
    if (!callApi && receivedJson?.code) {
      result = receivedJson;
    } else {
      result = await getTransactionInfo(transactionId);
    }
    const txn = await Transaction.findOne({ where: { requestId: transactionId, title: { [Op.or]: ['Wallet Recharge', 'Child Report'] } } });
    if (!txn) throw new ApiError('Bad Request', 400);

    const amountXGST = (txn.title !== 'Child Report') ? Math.round(Number(result.data?.amount) / 1.18) : Number(result.data?.amount);
    if (txn.status === 'success') {
      const cashback = await calculateCashback(txn, amountXGST);
      return {
        txnStatus: txn.status,
        paymentStatus: result.code,
        status: true,
        message: result.code,
        amount: `${amountXGST}`,
        cashback: cashback,
      };
    }

    txn.state = result.data?.state;
    txn.status = 'pending';
    txn.code = result.code;
    txn.txnid = result.data?.transactionId;
    if (result.data?.state !== 'PENDING') {
      txn.status = result.code === "PAYMENT_SUCCESS" ? 'success' : 'failed';
    }
    await txn.save();

    let cashbackAmt;
    if (txn.status === 'success' && txn.title !== 'Child Report') {
      cashbackAmt = await updateUserWallet(txn, result);
      console.log("success cashbackamt", cashbackAmt);

      try {
        await summarizeLastChat(txn.user_id);
      } catch (error) {
        console.log("Error while summarizing chat: ", error);
      }
    }
    const response = {
      txnStatus: txn.status,
      paymentStatus: result.code,
      status: true,
      message: result.code,
      amount: `${amountXGST}`,
      cashback: cashbackAmt || 0,
    };
    console.log("UPDATE RES >>>", response);
    return response;
  } catch (error: any) {
    console.log("UPDATE ERR >>>", error);
    return { txnStatus: 'pending', paymentStatus: error?.code, status: false, message: error?.message, amount: `0` };
  }
};

const findValidCashback = async (amountXGST: number, txn: Transaction): Promise<number> => {
  const today_date = new Date();

  const isCashbackAvailable = await Offer.findOne({
    where: {
      recharge_amount: amountXGST,
      status: true,
      offer_startdate: { [Op.lte]: today_date },
      offer_enddate: { [Op.gt]: today_date },
      recharge_type: "regular_recharge"
    }
  });
  let cashbackAmount = isCashbackAvailable?.cashback_amount ?? amountXGST;
  console.log("before Cashback: ", cashbackAmount);
  const txnCount = await Transaction.count({
    where: {
      title: 'Wallet Recharge',
      txn_type: "credit",
      status: "success",
      user_id: txn.user_id
    },
  });
  console.log("No of existing transaction: ", txnCount);
  const slabResult = await Slab.findAll({
    where: {
      is_delete: false,
      status: true,
      slab_limit: { [Op.gte]: txnCount },
      slab_type: 'recharge',
    },
    attributes: ["id", "slab_limit"],
    order: [["slab_limit", "ASC"]],
    limit: 1,
  });
  const slabId = slabResult[0]?.dataValues?.id;
  console.log("slabId: ", slabId);
  if (slabId) {
    const offerAvailable = await Offer.findOne({
      where: {
        recharge_amount: amountXGST,
        status: true,
        offer_startdate: { [Op.lte]: today_date },
        offer_enddate: { [Op.gt]: today_date },
        slab_id: slabId,
        recharge_type: "slab_recharge"
      }
    });
    cashbackAmount = offerAvailable?.cashback_amount ? offerAvailable?.cashback_amount : cashbackAmount;
  }

  console.log("After Cashback: ", cashbackAmount);
  return cashbackAmount;
}

const calculateCashback = async (txn: Transaction, amountXGST: number): Promise<number> => {
  const cashBackTransaction = await Transaction.findOne({
    where: {
      title: "Cashback offer",
      txn_type: "credit",
      status: "success",
      user_id: txn.user_id,
      requestId: txn.requestId,
    },
  });
  if (cashBackTransaction) {
    return cashBackTransaction?.ammount + amountXGST;
  } else {
    return amountXGST;
  }
};

const summarizeLastChat = async (userId: number): Promise<void> => {
  const lastChat = await UserCall.findAll({
    where: {
      userId: userId,
      callType: 'chat',
      call_status: 'ended',
      callDuration: { [Op.gt]: 0 },
    },
    attributes: ["id", "channelId", "astroId", "userId", "callType", "callDuration", "call_status", "firebaseChId"],
    order: [["updatedAt", "DESC"]],
    limit: 1,
  });
  if (lastChat.length > 0) {
    const lastChatSummary = await ChatSummary.findOne({ where: { channel_id: lastChat[0].channelId } });
    if (!lastChatSummary) {
      const result = await fetchChatSummary(lastChat[0].firebaseChId);
      if (result) {
        const addSummary = new ChatSummary({
          channel_id: lastChat[0].channelId,
          summary_lang: 'English',
          summary: result.chatSummary,
          user_call_id: lastChat[0].id,
        });
        await addSummary.save();
      }
    }
  }
}

const updateMaxMinute = async (txn: Transaction, user: User, addedAmount: number): Promise<void> => {
  if (!txn.channelId) return;
  const call = await UserCall.findOne({
    where: {
      channelId: txn.channelId,
      call_status: { [Op.ne]: "ended" }
    }
  });
  console.log("inside updateMaxMinute>>>>>>>>>>>>>> ");
  if (call) {
    console.log("inside call >>>>>>>>>>>>>> ");
    const astrologer = await Astrologer.findByPk(call.astroId);
    if(!astrologer) throw new ApiError("Astro not found for this number", 200);
    let perMinCharge = astrologer?.per_min_chat;

    const consultCount = await UserCall.count({
      where: {
        userId: user.id,
        call_status: "ended",
        callDuration: { [Op.gt]: 0 },
      },
    });
    const isFirstConsult = consultCount === 0;
    let chatPrices;
    if (isFirstConsult) {
      const slabResult = await Slab.findAll({
        where: {
          consult_type: 'chat',
          is_delete: false,
          status: true,
          slab_limit: { [Op.gt]: 1 },
          slab_type: 'consult',
        },
        attributes: ["id", "slab_limit"],
        order: [["slab_limit", "ASC"]],
        limit: 1,
      });
      const slabId = slabResult[0]?.dataValues?.id;
      chatPrices = await PriceSlab.findOne({
        where: {
          astro_id: astrologer?.id,
          consult_type: 'chat',
          slab_id: slabId,
          is_delete: false,
          status: true,
        },
        attributes: [
          "price_per_consult",
          "price_per_consult_mrp",
          "astro_commission",
          "slab_id",
        ],
      });
    } else {
      const consultType = call.callType;
      chatPrices = await calculateConsultPrice(consultType, astrologer, user);
    }
    if (chatPrices && chatPrices.price_per_consult) {
      perMinCharge = chatPrices.price_per_consult;
    }
    call.prevMaxMinute = call.maxMinute;

    call.maxMinute = call.maxMinute + parseInt(String(Number(addedAmount) / Number(perMinCharge)));
    console.log("final max minute: ", call.maxMinute);
    await call.save();
  }
  return;
}

export default updateTransaction; 