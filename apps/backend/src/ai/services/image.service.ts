import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { parseJsonFromMarkdown } from "../utils/responseParser";
import { config } from "../../config";
import { createChallengeVerificationPrompt } from "../prompt/image.prompt";
import path from "path";
import fs from 'fs'

export const recognizeImage = async (url: string) => {
  if (!url?.trim()) {
    throw new AppError("Image URL is required", 400);
  }

  // Add URL validation to prevent SSRF
  try {
    const parsedUrl = new URL(url);
    
    // Block internal/private URLs
    const hostname = parsedUrl.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')) {
      throw new AppError("Invalid image URL - internal addresses not allowed", 400);
    }
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new AppError("Invalid image URL protocol", 400);
    }
  } catch (error) {
    throw new AppError("Invalid image URL format", 400);
  }

  let response: Response;
  let imageArrayBuffer: ArrayBuffer;

  try {
    response = await fetch(url);
  } catch (error) {
    throw new AppError("Failed to fetch image from URL", 400);
  }

  if (!response.ok) {
    throw new AppError(`Failed to fetch image: ${response.status} ${response.statusText}`, 400);
  }

  // Check file size
  const contentLength = response.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > config.ai.maxFileSize) {
    throw new AppError(`Image too large (max ${config.ai.maxFileSize / (1024 * 1024)}MB)`, 400);
  }

  // Check content type
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.startsWith('image/')) {
    throw new AppError("URL does not point to a valid image", 400);
  }

  try {
    imageArrayBuffer = await response.arrayBuffer();
  } catch (error) {
    throw new AppError("Failed to read image data", 400);
  }

  // Additional size check after download
  if (imageArrayBuffer.byteLength > config.ai.maxFileSize) {
    throw new AppError(`Image too large (max ${config.ai.maxFileSize / (1024 * 1024)}MB)`, 400);
  }

  const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");

  const result = await ai.models.generateContent({
    model: config.ai.model,
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: contentType,
              data: base64ImageData,
            },
          },
          {
            text: `You are an AI that identifies recyclable materials and objects in an image.
              Return ONLY valid JSON in the following format:

              {
                "materials": [
                  { "name": "item name", "quantity": number }
                ],
                "description": "short sentence describing the image",
                "recyclableItems": number,
                "suggestions": ["suggestion1", "suggestion2"]
              }

              Rules:
              - Use singular names (e.g., "bottle", not "bottles")
              - Estimate quantities if possible (e.g., 3 bottles, 1 table)
              - Keep description short (max 1 sentence)
              - Focus on recyclable materials
              - Provide 1-3 upcycling suggestions`,
          },
        ],
      },
    ],
  });

  const text = result.text;
  if (!text?.trim()) {
    throw new AppError("AI did not return a response", 500);
  }

  const parsed = parseJsonFromMarkdown(text);
  if (!parsed || typeof parsed !== "object") {
    throw new AppError("Invalid AI response format", 500);
  }

  // Validate response structure
  if (!parsed.materials || !Array.isArray(parsed.materials)) {
    throw new AppError("AI response missing materials array", 500);
  }

  return parsed;
};

export const verifyChallengeAI = async (
  description: string,
  imageUrl: string,
  points: number,
  userId: number
) => {
  if (!description?.trim()) throw new Error("Challenge description required");
  if (!imageUrl?.trim()) throw new Error("Image URL required");
  if (!points || points <= 0) throw new Error("Valid challenge points required");

  const filePath = path.join(process.cwd(), imageUrl);
  if (!fs.existsSync(filePath)) throw new Error("Image file not found");

  const imageBuffer = fs.readFileSync(filePath);
  const base64ImageData = imageBuffer.toString("base64");

  const ext = path.extname(filePath).toLowerCase();
  const contentType =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";

  const prompt = createChallengeVerificationPrompt(description, imageUrl, points, Date.now(), userId );

  const result = await ai.models.generateContent({
    model: config.ai.model,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: contentType, data: base64ImageData } },
          { text: prompt },
        ],
      },
    ],
  });

  const text = result.text;
  if (!text?.trim()) throw new Error("AI verification failed");

  const verification = parseJsonFromMarkdown(text);
  if (!verification || typeof verification !== "object")
    throw new Error("Invalid AI verification format");

  return verification;
};