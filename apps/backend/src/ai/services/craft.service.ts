import { groq } from "../config/groq-cloud";


export interface CraftProject {
  title: string;
  description: string;
  steps: string[];
  materialsUser: string[];
}

export async function generateCraftFromItems(items: { name: string }[]): Promise<CraftProject> {
  const recyclableMaterials = items.map(i => i.name).join(", ");

  const response = await groq.chat.completions.create({
    model: "moonshotai/kimi-k2-instruct",
    messages: [
      {
        role: "system",
        content: "You are an AI that creates craft projects from recyclable materials."
      },
      {
        role: "user",
        content: `Create a craft project using the following recyclable materials: ${recyclableMaterials}.
Return JSON with title, description, step-by-step instructions (steps), and a list of materials the user will need (materialsUser).`
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
            steps: { type: "array", items: { type: "string" } },
            materialsUser: { type: "array", items: { type: "string" } }
          },
          required: ["title", "description", "steps", "materialsUser"],
          additionalProperties: false
        }
      }
    }
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(content) as CraftProject;
}
