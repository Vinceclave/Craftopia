// apps/backend/src/ai/utils/responseParser.ts

import { AppError } from "../../utils/error";

export const parseResponse = (rawText: string | undefined) => {
    if (!rawText?.trim()) {
        throw new AppError('AI returned empty response', 500);
    }

    // Clean up markdown
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    }

    // Parse JSON
    try {
        return JSON.parse(cleanText);
    } catch (err) {
        console.error("Failed to parse AI response:", rawText);
        throw new AppError('AI returned invalid JSON format', 500);
    }
};