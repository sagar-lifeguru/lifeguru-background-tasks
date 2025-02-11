import axios from 'axios';

const sendSMS = async (
  phone: string,
  template_id: string,
  message_body: string,
  message_type: string = 'TXN'
): Promise<void> => {
  const api_key = process.env.KALEYRA_API_KEY;
  const sid = process.env.KALEYRA_SID;
  const sender = process.env.KALEYRA_SENDER;

  if (!api_key || !sid || !sender) {
    throw new Error("Missing Kaleyra API credentials");
  }

  try {
    await axios.post(`https://api.kaleyra.io/v1/${sid}/messages`, {
      to: `+91${phone}`,
      sender: sender,
      template_id: template_id,
      type: message_type,
      body: message_body,
    }, {
      headers: {
        'api-key': api_key,
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error("sendSMS error:", error.response?.data || error);
  }
};

export default sendSMS;
