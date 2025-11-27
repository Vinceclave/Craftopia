import { GoogleGenAI } from '@google/genai';
import { config } from '../../config';

export const ai = new GoogleGenAI({
  apiKey: config.ai.apiKey,
});

export const aiImage = new GoogleGenAI({
  apiKey: "AIzaSyCPVxhwhR6iqCWa4__iENDkc5Dsxf6wcNE",
});
  