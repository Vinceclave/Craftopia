import { AppError } from "../../utils/error";
import { ai } from "../gemini/client";
import { craftPrompt } from "../prompt/craft.prompt";
import { parseJsonFromMarkdown } from "../utils/responseParser";
import { config } from "../../config";

export const generateCraft = async (materials: string | string[]) => {
    // Normalize input: join array into a single string if needed
    const cleanMaterials = Array.isArray(materials)
        ? materials.map(m => m.trim()).filter(Boolean).join(', ')
        : materials?.trim();

    // Validation
    if (!cleanMaterials) {
        throw new AppError('Materials are required', 400);
    }

    if (cleanMaterials.length < 3) {
        throw new AppError('Materials description too short (minimum 3 characters)', 400);
    }

    if (cleanMaterials.length > 200) {
        throw new AppError('Materials description too long (max 200 characters)', 200);
    }

    // Check for harmful content
    const harmfulKeywords = ['weapon', 'explosive', 'dangerous', 'toxic', 'poison'];
    const lowerMaterials = cleanMaterials.toLowerCase();

    if (harmfulKeywords.some(keyword => lowerMaterials.includes(keyword))) {
        throw new AppError('Cannot generate craft ideas for potentially harmful materials', 400);
    }

    try {
        const prompt = craftPrompt(cleanMaterials);

        const response = await ai.models.generateContent({
            model: config.ai.model,
            contents: prompt,
        });

        const text = response.text;
        if (!text?.trim()) {
            throw new AppError('AI did not return a response', 500);
        }

        const ideas = parseJsonFromMarkdown(text);

        if (!Array.isArray(ideas) || ideas.length === 0) {
            throw new AppError('AI could not generate craft ideas for the provided materials', 500);
        }

        // Validate each idea structure
        const validIdeas = ideas.filter(idea => 
            idea && 
            typeof idea === 'object' &&
            typeof idea.title === 'string' &&
            typeof idea.description === 'string' &&
            Array.isArray(idea.steps) &&
            idea.title.trim() &&
            idea.description.trim() &&
            idea.steps.length > 0
        );

        if (validIdeas.length === 0) {
            throw new AppError('AI returned invalid craft idea format', 500);
        }

        return { 
            materials: Array.isArray(materials) ? materials : [materials],
            ideas: validIdeas,
            count: validIdeas.length,
            generatedAt: new Date().toISOString()
        };

    } catch (error: any) {
        if (error instanceof AppError) throw error;

        console.error('AI Craft Generation Error:', error);

        if (error.message?.includes('API key')) {
            throw new AppError('AI service configuration error', 500);
        }

        if (error.message?.includes('quota')) {
            throw new AppError('AI service quota exceeded, please try again later', 503);
        }

        throw new AppError('Failed to generate craft ideas from AI service', 500);
    }
};
