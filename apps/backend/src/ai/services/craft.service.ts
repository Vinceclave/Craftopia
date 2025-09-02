// src/services/craft.service.ts
import { groq } from "../config/groq";
import { AICraftRequest, AICraftResponse } from "../types/craft.types";

export const generateCraftIdeas = async (data: AICraftRequest): Promise<AICraftResponse> => {
  const prompt = `
    Generate craft ideas using these materials: ${data.materials.join(", ")}.
    Include title, description, type, and step-by-step instructions.
    Follow this JSON format:
    { "suggestions": [ { "title": "", "description": "", "steps": [], "materialsUsed": [], "type": "" } ] }
  `;

  const response = await groq.chat.completions.create({
    model: "moonshotai/kimi-k2-instruct",
    messages: [
      { role: "system", content: "You are an AI craft generator." },
      { role: "user", content: prompt }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "craft_generation",
        schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  steps: { type: "array", items: { type: "string" } },
                  materialsUsed: { type: "array", items: { type: "string" } },
                  type: { type: "string" }
                },
                required: ["title", "description", "steps", "materialsUsed", "type"]
              }
            }
          },
          required: ["suggestions"],
          additionalProperties: false
        }
      }
    }
  });

  return JSON.parse(response.choices[0].message.content || "{}") as AICraftResponse;
};
