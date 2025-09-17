import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';
import { errorHandler } from './middlewares/error.middleware';
import { config } from './config';
import * as fs from 'node:fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || 'AIzaSyC2DkRDKD3FItRIj3XBkkpEfUPnvZ4TuwY',
});

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  
  origin: [
    'http://localhost:3001',
    'http://localhost:8081',
    'http://192.168.1.6:3001', // your LAN IP if testing from device
    // config.frontend.url
  ],
  credentials: true
}));

// General middleware
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1', apiRoutes);
app.post("/generate-text", async (req, res) => {
  try {
    const material = req.body.prompt as string;

    if (!material) {
      return res.status(400).json({ error: "Material is required" });
    }

    // Engineered Craftopia prompt
    const systemPrompt = `
You are Craftopia, an AI assistant that suggests creative and eco-friendly upcycling ideas.  
Your role is to help users turn recyclable or discarded materials into useful, sustainable crafts.  

⚡ Rules for response:
- Always respond in **valid JSON** only.  
- The output must be a JSON array.  
- Each craft idea must contain:
  - "title" → a short, catchy name for the craft idea.  
  - "description" → 1–3 sentences explaining how to make it and why it’s eco-friendly.  
  - "steps" → an array of simple step-by-step instructions.  
- Do not include any text outside the JSON.  

🎯 Material provided: "${material}"  

✅ Example response:
[
  {
    "title": "Bottle Planter",
    "description": "Cut a plastic bottle in half and turn it into a small planter for herbs or succulents. This reduces waste while adding greenery indoors.",
    "steps": [
      "Cut the plastic bottle in half.",
      "Make small drainage holes at the bottom.",
      "Fill the bottom half with soil.",
      "Plant herbs or small flowers inside."
    ]
  },
]

Now generate 3–5 creative and sustainable craft ideas using the material above.
    `;

    // Call Gemini (adjust if using @google/generative-ai directly)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: systemPrompt,
    });

    // Safely extract response text
    const rawText: string = response.text ?? "";

    if (!rawText.trim()) {
      return res.status(500).json({ error: "AI returned empty response" });
    }

    // Try parsing the JSON
    let ideas;
    try {
      ideas = JSON.parse(rawText);
    } catch (err) {
      console.error("Failed to parse AI response:", rawText);
      return res.status(500).json({ error: "AI returned invalid JSON" });
    }

    // Return structured JSON
    return res.status(200).json({
      material,
      ideas,
    });

  } catch (error) {
    console.error("Error generating text:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;