// src/services/recycling.service.ts
import { groq } from "../config/groq";
import { RecyclingRequest, RecyclingResponse } from "../types/recycling.types";

export const detectRecyclingMaterials = async (data: RecyclingRequest): Promise<RecyclingResponse> => {
  const prompt = `
    Detect recyclable materials in this image.
    Return JSON with: name, quantity, and detailed description of each material.
  `;

  const response = await groq.chat.completions.create({
    model: "moonshotai/kimi-k2-instruct",
    messages: [
      { role: "system", content: "You are an AI recycling detector." },
      { role: "user", content: [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: data.imageUrl } }
      ]}
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "recycling_detection",
        schema: {
          type: "object",
          properties: {
            materials: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  description: { type: "string" }
                },
                required: ["name", "quantity", "description"]
              }
            }
          },
          required: ["materials"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(response.choices[0].message.content || "{}") as RecyclingResponse;
};
