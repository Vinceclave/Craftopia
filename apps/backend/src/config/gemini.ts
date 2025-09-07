import { GoogleGenAI } from '@google/genai';
import { config }from './index';

export const ai = new GoogleGenAI({
  apiKey: config.ai.apiKey,
});
