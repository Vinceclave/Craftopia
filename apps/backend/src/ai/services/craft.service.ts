// apps/backend/src/ai/services/ai.service.ts - SIMPLIFIED IMPROVEMENTS

import { ai } from "../../config/gemini";
import { AppError } from "../../utils/error";
import { craftPrompt } from "../prompt/promptCraft";

export const generateCraft = async (materials: string) => {
    // Basic validation
    if (!materials || typeof materials !== 'string' || materials.trim() === '') {
        throw new AppError('Materials are required', 400);
    }

    if (materials.length > 200) {
        throw new AppError('Materials description too long (max 200 characters)', 400);
    }

    const prompt = craftPrompt(materials.trim());

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const rawText = response.text?.trim() || "";

        if (!rawText) {
            throw new AppError('AI returned empty response', 500);
        }

        // Clean up the response (remove markdown if present)
        let cleanText = rawText;
        if (cleanText.startsWith('```json')) {
            cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        }

        // Parse JSON
        let ideas;
        try {
            ideas = JSON.parse(cleanText);
        } catch (err) {
            console.error("Failed to parse AI response:", rawText);
            throw new AppError('AI returned invalid response format', 500);
        }

        // Basic validation
        if (!Array.isArray(ideas) || ideas.length === 0) {
            throw new AppError('AI did not return valid craft ideas', 500);
        }

        return { 
            materials: materials.trim(), 
            ideas,
            count: ideas.length 
        };

    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        console.error("AI service error:", error);
        throw new AppError('Failed to generate craft ideas', 500);
    }
};