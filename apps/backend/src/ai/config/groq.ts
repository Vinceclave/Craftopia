// src/config/groq.config.ts
import Groq from "groq-sdk";

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // store key in .env
});
