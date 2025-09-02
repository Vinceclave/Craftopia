import { groq } from '../config/groq-cloud';
import { CraftProject, RecyclableItem } from '../types';

export async function generateCraftProject(items: RecyclableItem[]): Promise<CraftProject> {
  const materials = items.map(item => `${item.quantity}x ${item.name}`).join(', ');

  const response = await groq.chat.completions.create({
    model: "moonshotai/kimi-k2-instruct",
    messages: [
      {
        role: "system",
        content: `Create DIY craft projects from recyclable materials.

Requirements:
- Use only the provided materials
- Include clear step-by-step instructions
- Specify difficulty level and time needed
- Make it practical and safe

Return JSON format:
{
  "title": "Project Name",
  "description": "Brief description",
  "materials": ["material1", "material2"],
  "steps": ["step1", "step2"],
  "difficulty": "Easy|Medium|Hard",
  "timeMinutes": 30
}`
      },
      {
        role: "user",
        content: `Create a craft project using: ${materials}`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "craft_project",
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            materials: { type: "array", items: { type: "string" } },
            steps: { type: "array", items: { type: "string" } },
            difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
            timeMinutes: { type: "number" }
          },
          required: ["title", "description", "materials", "steps", "difficulty", "timeMinutes"]
        }
      }
    }
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as CraftProject;
}