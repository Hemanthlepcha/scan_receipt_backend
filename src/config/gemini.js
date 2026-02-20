import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Use gemini-2.0-flash-exp (experimental) or gemini-1.5-pro for image analysis
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export { genAI, model };
