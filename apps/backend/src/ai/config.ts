import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  groqApiKey: process.env.GROQ_API_KEY!,
  model: 'llama-3.3-70b-versatile',
  port: process.env.PORT || 5000
};