import axios from 'axios';

const sendWhatsAppRechargeMsg = async (phone: string, amt: number, updatedBal: number): Promise<void> => {
  try {
    const template_id = process.env.INTERAKT_TEMPLATE_ID!;
    const url = process.env.INTERAKT_URL!;
    const apiKey = 'Basic T0VMRTdZTUhNN0JQXzNkSjIxbnY4V3dUUmZKSERTeEhtRDRsd1FVQ1I4azo=';
    const data = JSON.stringify({
      "countryCode": "+91",
      "phoneNumber": phone,
      "type": "Template",
      "template": {
        "name": template_id,
        "languageCode": "en",
        "bodyValues": [
          amt,
          updatedBal
        ]
      }
    });
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: url,
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      data: data
    };
    await axios(config);
  } catch (error) {
    console.log("WhatsApp message error: ", error);
  }
}

export default sendWhatsAppRechargeMsg; 