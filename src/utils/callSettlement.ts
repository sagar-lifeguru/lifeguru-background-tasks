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
  try {
    // Fetch the call record
    const call : UserCall | null = await UserCall.findOne({ where: { channelId } });
    if (!call) return false;
    // Check call duration
    if (call.callDuration <= 0) return false;

    // Check start time
    if(call.startTime){
      const callStart : number | null = new Date(call.startTime).getTime();
      if ( callStart && callStart < 1695666600) {
        return false;
      }
    }

    // Check if there's already a debit transaction for this user/channel
    const transactionExist = await Transaction.findOne({
      where: {
        channelId,
        txn_type: "debit",
        user_type: "user",
        user_id: call.userId,
      },
    });
    if (transactionExist) {
      return false;
    }

    // Fetch astrologer and user
    const astrologer = await Astrologer.findByPk(call.astroId);
    const user = await User.findByPk(call.userId);
    if (!astrologer || !user) return false;

    // If user wallet is less than perMinCharge, return false
    if (Number(user.wallet) < call.perMinCharge) {
      console.log("WALLET BALANCE LESS THAN 1 MIN CHAT", channelId, user.id);
      return false;
    }

    // Base calculations
    let totalCharge = Math.ceil(call.perMinCharge * call.callDuration);
    let actualDeductedAmount = Math.min(totalCharge, Number(user.wallet));

    let perMinCommission: String | number =
      call.callType === "call"
        ? astrologer.per_min_voice_call_commission
        : astrologer.per_min_commission;

    // If astro_commission is provided on the call, override
    if (call.astro_commission !== null && call.astro_commission !== undefined) {
      perMinCommission = call.astro_commission;
    }

    let astroCommission = Math.ceil(
      Number(perMinCommission) * call.callDuration
    );
    let adminCommission = actualDeductedAmount - astroCommission;
    if (adminCommission < 0) {
      adminCommission = 0;
    }

    // Check how many ended calls the user has had
    const chatCount = await UserCall.count({
      where: {
        call_status: "ended",
        callDuration: { [Op.gt]: 0 },
        userId: user.id,
      },
    });

    // Initialize priceBreakup arrays
    let userPriceBreakup: Array<{ [key: string]: number }> = [];
    let astroPriceBreakup: Array<{ [key: string]: number }> = [];

    // If it's the user's first successful call/chat
    if (chatCount === 1) {
      // If the charge is 1 for the first 5 minutes
      if (call.perMinCharge === 1) {
        await Astrologer.increment("quota_used", {
          by: 1,
          where: { id: call.astroId },
        });
      }

      // If chat duration is more than 5 minutes, we fetch new slab and break it up.
      if (call.callDuration > 5 && call.callType === "chat") {
        const slabResult = await Slab.findAll({
          where: {
            consult_type: call.callType,
            is_delete: false,
            status: true,
            slab_limit: { [Op.gt]: 1 },
            slab_type: "consult",
          },
          attributes: ["id", "slab_limit"],
          order: [["slab_limit", "ASC"]],
          limit: 1,
        });
        const slabId = slabResult[0]?.dataValues?.id;

        const consultPrices = await PriceSlab.findOne({
          where: {
            astro_id: astrologer.id,
            consult_type: call.callType,
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

        let perMinSecondCharge = consultPrices?.price_per_consult
          ? consultPrices?.price_per_consult
          : astrologer.per_min_chat;

        totalCharge =
          call.perMinCharge * 5 + (call.callDuration - 5) * perMinSecondCharge;
        actualDeductedAmount = Math.min(totalCharge, Number(user.wallet));

        let perMinSecondCommission = consultPrices?.astro_commission
          ? consultPrices?.astro_commission
          : astrologer.per_min_commission;

        astroCommission =
          Math.ceil(Number(perMinCommission) * 5) +
          Math.ceil(Number(perMinSecondCommission) * (call.callDuration - 5));

        adminCommission = actualDeductedAmount - astroCommission;
        if (adminCommission < 0) {
          adminCommission = 0;
        }

        astroPriceBreakup = [
          {
            chat_duration: 5,
            per_min_chat_price: Number(perMinCommission),
            earnings: Math.ceil(Number(perMinCommission) * 5),
          },
          {
            chat_duration: call.callDuration - 5,
            per_min_chat_price: perMinSecondCommission,
            earnings: Math.ceil(
              Number(perMinSecondCommission) * (call.callDuration - 5)
            ),
          },
        ];

        userPriceBreakup = [
          {
            chat_duration: 5,
            per_min_chat_price: call.perMinCharge,
            deductions: Math.ceil(Number(call.perMinCharge) * 5),
          },
          {
            chat_duration: call.callDuration - 5,
            per_min_chat_price: perMinSecondCharge,
            deductions: Math.ceil(
              Number(perMinSecondCharge) * (call.callDuration - 5)
            ),
          },
        ];
      }
    }

    // Cashback logic: if there's an amount to deduct, try to adjust from available_balance
    const todayDate = new Date();
    if (actualDeductedAmount > 0) {
      let adjustableAmt = actualDeductedAmount;
      const cbTransactions = await Transaction.findAll({
        where: {
          user_type: "user",
          user_id: call.userId,
          recharge_type: "CASHBACK",
          txn_type: "credit",
          available_balance: { [Op.gt]: 0 },
          expiry_date: { [Op.gte]: todayDate },
        },
        order: [["expiry_date", "ASC"]],
      });

      for (const cbTransaction of cbTransactions) {
        if (adjustableAmt <= 0) {
          break;
        }
        
        if (cbTransaction.available_balance <= adjustableAmt) {
          console.log(
            "USE ENTIRE BALANCE >>",
            cbTransaction.available_balance,
            adjustableAmt
          );
          adjustableAmt -= cbTransaction.available_balance;
          cbTransaction.available_balance = 0;
        } else {
          console.log(
            "UPDATE BALANCE >>",
            cbTransaction.available_balance,
            adjustableAmt
          );
          cbTransaction.available_balance =
            cbTransaction.available_balance - adjustableAmt;
          adjustableAmt = 0;
        }
        await cbTransaction.save();
      }
    }

    // Update user wallet after final deduction
    const userUpdatedBalance = Number(user.wallet) - actualDeductedAmount;
    user.wallet = userUpdatedBalance >= 0 ? String(userUpdatedBalance) : "0";
    await user.save();

    // Update astrologer wallet
    const astroUpdatedBalance = parseInt(String(astrologer.wallet)) + astroCommission;
    astrologer.wallet = astroUpdatedBalance;
    await astrologer.save();

    // Transaction titles
    let txnTitle =
      call.callType === "call"
        ? `Call with ${astrologer.display_name}`
        : `Chat with ${astrologer.display_name}`;
    let txnTitleAstro =
      call.callType === "call"
        ? `Call with ${user.user_name}`
        : `Chat with ${user.user_name}`;

    // Create user debit transaction
    const userTxn = await Transaction.create({
      txnid: `${crypto.randomUUID()}-${Date.now()}`,
      requestId: `${crypto.randomUUID()}-${Date.now()}`,
      status: "success",
      user_id: user.id,
      user_phone: user.phone,
      user_type: "user",
      calltype: call.callType,
      channelId: call.channelId,
      ammount: actualDeductedAmount.toString(),
      txn_type: "debit",
      txn_by: "admin",
      title: txnTitle,
      price_breakup: JSON.stringify(userPriceBreakup),
    });

    // Create astrologer credit transaction
    const astroTxn = await Transaction.create({
      txnid: `${crypto.randomUUID()}-${Date.now()}`,
      requestId: `${crypto.randomUUID()}-${Date.now()}`,
      status: "success",
      user_id: astrologer.id,
      user_phone: astrologer.phone,
      user_type: "astro",
      calltype: call.callType,
      channelId: call.channelId,
      ammount: astroCommission.toString(),
      txn_type: "credit",
      txn_by: "admin",
      title: txnTitleAstro,
      price_breakup: JSON.stringify(astroPriceBreakup),
    });

    // Create commission record
    const commissionRecord = await Commision.create({
      ammount: totalCharge,
      astro_amount: astroCommission,
      astro_id: astrologer.id,
      commission_amount: adminCommission,
      commission: perMinCommission,
      channel_id: call.channelId,
    });

    // Send user debit SMS if needed
    if (userUpdatedBalance >= 0 && actualDeductedAmount > 0) {
      // don't send sms for call started before 25-sep-2023
      await sendUserDebitMsg(user.phone, actualDeductedAmount, Number(user.wallet));
    }

    // If it's chat, possibly generate chat summary
    if (call.callType === "chat") {
      let perMinCharge = astrologer.per_min_chat;
      const slabPrices = await calculateConsultPrice(
        call.callType,
        astrologer,
        user
      );
      if (slabPrices && slabPrices.price_per_consult) {
        perMinCharge = slabPrices.price_per_consult;
      }
      if (Number(user.wallet) > Number(perMinCharge) * 5) {
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

    return true;
  } catch (error) {
    console.log("Error in call settlement: ", error);
  }
}

export default callSettlement;
