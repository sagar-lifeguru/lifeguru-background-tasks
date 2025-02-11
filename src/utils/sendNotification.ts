import axios from 'axios';
import fs from 'fs';
import { JWT } from 'google-auth-library';

type FirebaseCredentials = {
    client_email: string;
    private_key: string;
};

type NotificationData = {
    [key: string]: string | undefined| boolean| number; // Modify the index type to allow undefined values
    title?: string;
    body?: string;
};

const FCM_URL = process.env.FCM_URL as string;

const getAccessToken = async (): Promise<string> => {
    const path = process.env.GOOGLE_APPLICATION_CREDENTIALS as string;
    const fbCredObj: FirebaseCredentials = JSON.parse(fs.readFileSync(path, 'utf-8'));
    const SCOPES = ['https://www.googleapis.com/auth/firebase.messaging'];

    const client = new JWT({
        email: fbCredObj.client_email,
        key: fbCredObj.private_key,
        scopes: SCOPES,
    });
    
    const tokens = await client.authorize();
    return tokens.access_token as string;
};

const convertObjectToString = async (obj: Record<string, any>): Promise<Record<string, string>> => {
    const data: Record<string, string> = {};
    if (obj !== null && typeof obj === 'object') {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                data[String(key)] = String(obj[key]);
            }
        }
    }
    return data;
};

const sendNotification = async (deviceToken: string, data: NotificationData): Promise<boolean | any> => {
    console.log("DATA SEND TO FCM >>>", JSON.stringify(data), "DeviceToken >>>", deviceToken);
    
    if (!deviceToken) return false;
    
    const accessToken = await getAccessToken();
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };
    
    const title = data.title || "lifeguru";
    const bodyContent = data.body || "lifeguru";
    
    const formattedData = await convertObjectToString({ ...data });
    
    const body = {
        "message": {
            "token": deviceToken,
            "notification": {
                "title": title,
                "body": bodyContent,
            },
            "data": formattedData,
            "android": {
                "priority": "HIGH",
                "direct_boot_ok": true,
                "ttl": "0s",
                "notification": {
                    "click_action": "FLUTTER_NOTIFICATION_CLICK",
                    "notification_priority": "PRIORITY_MAX",
                    "visibility": "PUBLIC",
                    "sticky": true,
                    "default_sound": true,
                    "default_vibrate_timings": true,
                    "default_light_settings": true,
                    "local_only": true,
                }
            },
        },
    };

    try {
        const response = await axios.post(FCM_URL, body, { headers });
        return response.data;
    } catch (error: any) {
        console.error("Error sending FCM notification", error?.response?.status, error?.response?.statusText);
        return false;
    }
};

export default sendNotification;
