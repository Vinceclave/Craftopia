import { GoogleGenAI } from '@google/genai';
import { config } from '../../config';

export const ai = new GoogleGenAI({
    apiKey: config.ai.imageApiKey,
});

export const aiImage = new GoogleGenAI({
  apiKey: config.ai.imageApiKey,
});
  