import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config(); // Load your GEMINI_API_KEY from .env file

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // 替换为你的 API Key

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, how are you?");
        console.log(result.response.text());
    } catch (error) {
        console.error('Error:', error.massage);
    }
}

test();