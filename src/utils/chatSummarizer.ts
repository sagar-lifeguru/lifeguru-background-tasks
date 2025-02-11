import { GoogleGenerativeAI } from "@google/generative-ai";

interface GenerationConfig {
  temperature: number;
  top_p: number;
  top_k: number;
  max_output_tokens: number;
}

interface SafetySetting {
  category: string;
  threshold: string;
}

interface GenerativeModel {
  generateContent: (input: string) => Promise<{ response: { text: () => string | null } }>;
}

const chatSummarizer = async (inputChat: string, lang: string): Promise<string | null> => {
  try {
    const generationConfig: GenerationConfig = {
      temperature: 0.7,
      top_p: 0.9,
      top_k: 5,
      max_output_tokens: 2048,
    };

    const safetySettings: SafetySetting[] = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    ];
    
    const prompt: string = process.env.GEMINI_PROMPT || "";
    const apiKey: string | undefined = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model: GenerativeModel = genAI.getGenerativeModel({ model: "gemini-1.0-pro", generationConfig, safetySettings: safetySettings as import("@google/generative-ai/dist/generative-ai").SafetySetting[] });
    
    const inputData: string = `${inputChat}\n ${prompt} in ${lang}`;
    const result = await model.generateContent(inputData);
    
    return result.response.text() || null;
  } catch (error) {
    console.error("Error in chatSummarizer:", error);
    return null;
  }
};

export default chatSummarizer;
