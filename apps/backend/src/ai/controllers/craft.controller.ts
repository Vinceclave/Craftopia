// apps/backend/src/ai/controllers/craft.controller.ts - IMPROVED FOR APK

import { Response, Request } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";
import { generateCraft } from "../services/craft.service";

export const craftController = asyncHandler(async (req: Request, res: Response) => {
    const { materials, referenceImageBase64 } = req.body;
    // ✅ Additional validation for APK builds
    if (referenceImageBase64 !== undefined && referenceImageBase64 !== null) {
        if (typeof referenceImageBase64 !== 'string') {
            console.error('❌ referenceImageBase64 is not a string!');
            console.error('❌ Actual type:', typeof referenceImageBase64);
            console.error('❌ Value:', referenceImageBase64);
            return sendError(res, 'Reference image must be a base64 string', 400);
        }

        const imageLength = referenceImageBase64.length;
        if (imageLength < 100) {
            return sendError(res, 'Invalid or corrupted image data', 400);
        }
    } 

    if (!materials) {
        return sendError(res, 'Materials field is required', 400);
    }

    // Convert array to string
    let materialsString: string;

    if (Array.isArray(materials)) {
        // Join array items with commas
        materialsString = materials.join(', ');
    } else if (typeof materials === 'string') {
        materialsString = materials;
    } else {
        return sendError(res, 'Materials must be a string or array', 400);
    }

    // Validate the string
    if (!materialsString.trim()) {
        return sendError(res, 'Materials cannot be empty', 400);
    }

    try {
        const result = await generateCraft(materialsString, referenceImageBase64);
        sendSuccess(res, result, 'Craft ideas generated successfully');
    } catch (error: any) {
        console.error('❌ Craft generation failed:', error.message);
        console.error('❌ Stack:', error.stack);
        
        // Return a user-friendly error
        if (error.message.includes('Invalid reference image')) {
            return sendError(res, 'The uploaded image is invalid or corrupted. Please try again.', 400);
        }
        
        throw error; // Let asyncHandler handle other errors
    }
});