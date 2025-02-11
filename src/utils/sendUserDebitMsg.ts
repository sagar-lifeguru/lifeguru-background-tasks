import sendSMS from './sendSms';

const sendUserDebitMsg = async (phone: string, amt: number, updatedBal: number): Promise<boolean> => {
  if (amt <= 0) return false;

  const template_id = process.env.KALEYRA_ASTRO_CONSULT_TEPLATE_ID;
  if (!template_id) {
    throw new Error("Missing KALEYRA_ASTRO_CONSULT_TEPLATE_ID environment variable");
  }
  
  const body = `Rs ${amt} spent on consultation. New wallet balance: Rs ${updatedBal}. Thanks for using LifeGuru.`;
  await sendSMS(phone, template_id, body);
  
  return true;
};

export default sendUserDebitMsg;
