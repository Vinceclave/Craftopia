import { groq } from "../config/groq-cloud";

export interface RecyclableItem {
  name: string;
  quantity: number;
  recyclable: boolean;
  description?: string;
}

export async function detectRecyclableMaterials(imageUrl: string): Promise<RecyclableItem[]> {
  const response = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      {
        role: "system",
        content: `
You are an AI that identifies recyclable materials from images.
You should detect all items in the image, determine if each is recyclable (true/false), and provide quantity if possible.
Respond strictly in JSON format as an array of objects with properties: name, quantity, recyclable, description (optional).
Example response:
[
  {"name": "plastic bottle", "quantity": 2, "recyclable": true, "description": "PET plastic bottle"},
  {"name": "paper", "quantity": 1, "recyclable": true}
]
`
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze this image and detect recyclable materials:" },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
    temperature: 0,
    max_completion_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content ?? "[]";
  try {
    return JSON.parse(content) as RecyclableItem[];
  } catch (error) {
    console.error("Failed to parse AI response:", content, error);
    return [];
  }
}
