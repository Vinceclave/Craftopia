// apps/backend/src/ai/services/craft.service.ts - SIMPLE VERSION

import { AppError } from "../../utils/error";
import { ai } from "../gemini/client";
import { craftPrompt } from "../prompt/craft.prompt";
import { parseResponse } from "../utils/responseParser";

export const generateCraft = async (materials: string) => {
    if (!materials?.trim()) {
        throw new AppError('Materials are required', 400);
    }

    if (materials.length > 200) {
        throw new AppError('Materials description too long (max 200 characters)', 400);
    }

    const prompt = craftPrompt(materials.trim());

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    const ideas = parseResponse(response.text);

    if (!Array.isArray(ideas) || ideas.length === 0) {
        throw new AppError('AI did not return valid craft ideas', 500);
    }

    return { 
        materials: materials.trim(), 
        ideas,
        count: ideas.length 
    };
};