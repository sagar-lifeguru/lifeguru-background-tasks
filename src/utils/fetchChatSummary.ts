import axios from 'axios';
import { Buffer } from 'buffer';
import chatSummarizer from "./chatSummarizer";

interface ChatSummary {
    chat: string;
    chatSummary: string | null;
}

const fetchChatSummary = async (chatId: string): Promise<ChatSummary | null> => {
    try {
        const msg = await fetchChatData(chatId);
        const summary = await chatSummarizer(msg, "en"); // Assuming "en" as default language
        return {
            chat: msg,
            chatSummary: summary,
        };
    } catch (error) {
        console.error("Error in fetchChatSummary:", error);
        return null;
    }
};

const fetchChatData = async (chatId: string): Promise<string> => {
    try {
        const url = process.env.FIREBASE_URL;
        if (!url) throw new Error("FIREBASE_URL is not defined");
        
        const realtimeBaseUrl = `${url}/${chatId}.json`;
        const response = await axios.get(realtimeBaseUrl);
        const data = response.data;

        let msg = '';
        for (const encodeData in data) {
            const decodedMessageBuffer = Buffer.from(data[encodeData].message, 'base64');
            const decodedMessage = decodedMessageBuffer.toString('utf-8');
            msg += `${data[encodeData].time}: ${data[encodeData].name}: ${decodedMessage}\n`;
        }
        return msg;
    } catch (error: any) {
        if (error?.response?.status) {
            console.error("fetchChatSummary error:", error.response.status, error.response.statusText);
        } else {
            console.error("fetchChatSummary error:", error);
        }
        throw error;
    }
};

export default fetchChatSummary;
