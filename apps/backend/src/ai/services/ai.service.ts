import { ai } from "../../config/gemini";
import { AppError } from "../../utils/error";
import { craftPrompt } from "../prompt/promptCraft";

export const generateCraft = async (materials: string) => {
    if (!materials || typeof materials !== 'string' || materials.trim() === '') 
        throw new AppError('Invalid material provided', 400);

    const prompt = craftPrompt(materials);

      try {
        // Assuming ai is already initialized
        const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt, // Use the generated prompt
        });

        // Safely extract the response text
        const rawText: string = response.text ?? "";

        if (!rawText.trim()) {
        throw new AppError('AI returned empty response', 500); // Throw error for empty response
        }

        // Parse the raw response to JSON
        let ideas;
        try {
        ideas = JSON.parse(rawText);
        } catch (err) {
        console.error("Failed to parse AI response:", rawText);
        throw new AppError('AI returned invalid JSON', 500); // Handle invalid JSON
        }

        // Return structured JSON data
        return { materials, ideas };
    } catch (error) {
        // If there's an error in the process, rethrow it so the controller can handle it
        throw new AppError('Internal Server Error', 500);
    }
}
