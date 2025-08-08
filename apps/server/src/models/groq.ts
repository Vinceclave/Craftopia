// src/models/groq.ts

import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.GROQ_API_KEY) {
  throw new Error('Missing GROQ_API_KEY in .env');
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
