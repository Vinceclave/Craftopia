import { ai } from "../../config/gemini";
import { Response, Request } from 'express';

export const generateAndDisplayChallenge = async () => {
    const prompt = `Generate a recycling challenge as JSON:
{
  "title": "engaging 3-5 word title",
  "description": "specific 1-2 sentence task",
  "pointsReward": [random 1-100],
  "materialType": "Plastic|Glass|Paper|Metal",
  "source": "ai",
  "isActive": true
}

Focus on actionable sustainability tasks. Examples:
- "Plastic Bottle Upcycle" / "Transform 5 bottles into planters"
- "Glass Jar Revival" / "Repurpose 3 jars for food storage"`;

    const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    console.log(response.text);
}