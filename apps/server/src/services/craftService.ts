// src/services/groq.service.ts

import { groq } from '../config/groq.config';

/**
 * Generates a sustainable DIY craft project idea based on user-provided recyclable materials.
 *
 * @param userMaterials - The recyclable items provided by the user.
 * @returns A detailed, creative, and eco-friendly craft project idea.
 */
export const getGroqResponse = async (
  userMaterials: string
): Promise<string> => {
  if (!groq.apiKey) throw new Error('GROQ_API_KEY is not set');

  const systemPrompt = `You are Craftopia — an AI-powered eco-crafting assistant designed to help users upcycle recyclable materials into fun, functional, and environmentally friendly DIY projects.`;

  const userPrompt = `A user has submitted the following recyclable or reusable items:

${userMaterials}

Your task is to analyze and creatively combine ALL of these items into ONE cohesive DIY craft project. The goal is to promote sustainability, creativity, and accessibility.

Your output must follow this structured format:

---

🎨 **Title**: A catchy, fun, and descriptive title for the project.

🌿 **Overview**: A 2-3 sentence description of the project. Explain:
- What the project is
- Its environmental benefit
- Its practical or decorative value

🧰 **Materials Needed**:
- List all input materials (user-provided) and how they’ll be reused
- Add any additional basic tools or household items required (e.g., scissors, glue, tape)

🛠️ **Step-by-Step Instructions**:
Numbered, clear, beginner-friendly instructions. Assume the user has basic crafting skills. Be specific about how each material is used and in what order.

⏱️ **Time Estimate**: How long this project will take (e.g., “30–45 minutes”).

🔥 **Difficulty Level**: Choose between Easy, Moderate, or Challenging.

👶 **Age Suitability**: Example: “Suitable for ages 10+ with adult supervision.”

✨ **Creative Variations**:
List 2–3 ways to modify or enhance the project (e.g., using other materials, decorating options, seasonal themes).

🌎 **Eco-Tip**:
End with one short, practical eco-friendly tip related to at least one of the user’s materials (e.g., recycling, upcycling alternatives, disposal advice).`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.8,
      max_completion_tokens: 1200,
      top_p: 1,
      stream: false,
    });

    return chatCompletion.choices[0].message.content ?? '';
  } catch (error: any) {
    console.error('Error generating craft idea:', error.message);
    throw new Error('Failed to generate craft idea from Groq');
  }
};
