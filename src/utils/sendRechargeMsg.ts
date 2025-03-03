import sendSMS from './sendSms';

const sendRechargeMsg = async (phone: string, amt: number, updatedBal: number): Promise<void> => {
  console.log('send recharge', phone, amt, updatedBal);
  const template_id = process.env.KALEYRA_RECHARGE_TEPLATE_ID!;
  const body = `Wallet recharged! Rs ${amt} added. New balance: ${updatedBal}. Connect with LifeGuru astrologers now.`;
  await sendSMS(phone, template_id, body);
};

export default sendRechargeMsg; 