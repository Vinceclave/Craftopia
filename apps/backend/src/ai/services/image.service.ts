import { ai } from "../gemini/client";
import { AppError } from "../../utils/error";
import { parseResponse } from "../utils/responseParser";

export const recognizeImage = async (url: string) => {
  if (!url) throw new AppError("Image URL is required", 400);

  const response = await fetch(url);
  if (!response.ok) throw new AppError("Failed to fetch image", 400);

  const imageArrayBuffer = await response.arrayBuffer();
  const base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash", // ✅ fixed typo
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64ImageData,
            },
          },
          {
            text: `You are an AI that identifies objects in an image.
              Return ONLY valid JSON in the following format:

              {
                "materials": [
                  { "name": "item name", "quantity": number }
                ],
                "description": "short sentence describing the image"
              }

              Rules:
              - Use singular names (e.g., "apple", not "apples").
              - Estimate quantities if possible (e.g., 3 bottles, 1 table).
              - Keep description short (max 1 sentence).
            `,
          },
        ],
      },
    ],
  });

  const text = result.text;
  if (!text) throw new AppError("AI did not return a response", 500);

  // ✅ validate JSON without try/catch
  const parsed = parseResponse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new AppError("Invalid AI response format", 500);
  }

  return parsed;
};
