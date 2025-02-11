import crypto from "crypto";
import { Op } from "sequelize";
import moment from "moment";
import PriceSlab from "../models/priceSlab.model";
import Slab from "../models/slab.model";
import UserCall from "../models/userCall.model";
import Astrologer from "../models/astrologer.model";
import User from "../models/user.model";
import Commision from "../models/commision.model";
import Transaction from "../models/transaction.model";
import ChatSummary from "../models/chatSummary.model";
import sendUserDebitMsg from "./sendUserDebitMsg";
import calculateConsultPrice from "./calculateConsultPrice";
import fetchChatSummary from "./fetchChatSummary";

async function callSettlement(channelId: string): Promise<boolean | void> {
  const call = await UserCall.findOne({ where: { channelId } });
  if (!call || call.callDuration <= 0) return false;
  if (!call.startTime || new Date(call.startTime).getTime() < 1695666600) return false;

  const transactionExist = await Transaction.findOne({
    where: {
      channelId,
      txn_type: "debit",
      user_type: "user",
      user_id: call.userId,
    },
  });
  if (transactionExist) return false;

  const astrologer = await Astrologer.findByPk(call.astroId);
  if(!astrologer) return false;
  const user = await User.findByPk(call.userId);
  if(!user) return false;
  if (!astrologer || !user || Number(user.wallet) < call.perMinCharge) return false;

  let totalCharge = Math.ceil(call.perMinCharge * call.callDuration);
  let actualDeductedAmount = Math.min(totalCharge, Number(user.wallet));

  let perMinCommission = call.astro_commission ?? (call.callType === "call"
    ? astrologer.per_min_voice_call_commission
    : astrologer.per_min_commission);
  
  let astroCommission = Math.ceil(Number(perMinCommission) * call.callDuration);
  let adminCommission = Math.max(0, actualDeductedAmount - astroCommission);

  user.wallet = Math.max(0, Number(user.wallet) - actualDeductedAmount).toString();
  await user.save();

  astrologer.wallet = (Number(astrologer.wallet) + Number(astroCommission));
  await astrologer.save();

  await Transaction.create({
    txnid: `${crypto.randomUUID()}-${Date.now()}`,
    requestId: `${crypto.randomUUID()}-${Date.now()}`,
    status: "success",
    user_id: user.id,
    user_phone: user.phone,
    user_type: "user",
    calltype: call.callType,
    channelId: call.channelId,
    amount: actualDeductedAmount.toString(),
    txn_type: "debit",
    txn_by: "admin",
    title: `Call with ${astrologer.display_name}`,
  });

  await Transaction.create({
    txnid: `${crypto.randomUUID()}-${Date.now()}`,
    requestId: `${crypto.randomUUID()}-${Date.now()}`,
    status: "success",
    user_id: astrologer.id,
    user_phone: astrologer.phone,
    user_type: "astro",
    calltype: call.callType,
    channelId: call.channelId,
    amount: astroCommission.toString(),
    txn_type: "credit",
    txn_by: "admin",
    title: `Call with ${user.user_name}`,
  });

  await Commision.create({
    amount: totalCharge,
    astro_amount: astroCommission,
    astro_id: astrologer.id,
    commission_amount: adminCommission,
    commission: perMinCommission,
    channel_id: call.channelId,
  });

  if (actualDeductedAmount > 0) {
    await sendUserDebitMsg(user.phone, actualDeductedAmount, Number(user.wallet));
  }

  if (call.callType === "chat" && Number(user.wallet) > 5 * astrologer.per_min_chat) {
    const result = await fetchChatSummary(call.firebaseChId);
    if (result) {
      await ChatSummary.create({
        channel_id: call.channelId,
        summary_lang: "English",
        summary: result.chatSummary,
        user_call_id: call.id,
      });
    }
  }
}

export default callSettlement;
