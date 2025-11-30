// apps/backend/src/ai/controllers/craft.controller.ts - IMPROVED FOR APK

import { Response, Request } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";
import { generateCraft } from "../services/craft.service";

export const craftController = asyncHandler(async (req: Request, res: Response) => {
    const { materials, referenceImageBase64 } = req.body;

    console.log('🎨 ============================================');
    console.log('🎨 CRAFT CONTROLLER - Request Received');
    console.log('🎨 ============================================');
    console.log('📦 Materials:', materials);
    console.log('📦 Materials Type:', typeof materials);
    console.log('📦 Materials IsArray:', Array.isArray(materials));
    console.log('🖼️  Has referenceImageBase64:', !!referenceImageBase64);
    console.log('📏 Type of referenceImageBase64:', typeof referenceImageBase64);

    // ✅ Additional validation for APK builds
    if (referenceImageBase64 !== undefined && referenceImageBase64 !== null) {
        if (typeof referenceImageBase64 !== 'string') {
            console.error('❌ referenceImageBase64 is not a string!');
            console.error('❌ Actual type:', typeof referenceImageBase64);
            console.error('❌ Value:', referenceImageBase64);
            return sendError(res, 'Reference image must be a base64 string', 400);
        }

        const imageLength = referenceImageBase64.length;
        const imageSizeMB = (imageLength / (1024 * 1024)).toFixed(2);
        console.log('📊 Reference Image Length:', imageLength, 'characters');
        console.log('📊 Reference Image Size:', imageSizeMB, 'MB');
        console.log('🔍 Reference Image Preview (first 100 chars):', referenceImageBase64.substring(0, 100));

        // Check if it has proper data URI prefix
        if (referenceImageBase64.startsWith('data:image')) {
            console.log('✅ Image has proper data URI prefix');
        } else {
            console.log('⚠️  Image missing data URI prefix - might be raw base64');
        }

        // ✅ Validate minimum length
        if (imageLength < 100) {
            console.error('❌ Image too short:', imageLength);
            return sendError(res, 'Invalid or corrupted image data', 400);
        }
    } else {
        console.log('ℹ️  No reference image provided');
    }

    if (!materials) {
        return sendError(res, 'Materials field is required', 400);
    }

    // Convert array to string
    let materialsString: string;

    if (Array.isArray(materials)) {
        // Join array items with commas
        materialsString = materials.join(', ');
        console.log('📦 Converted array to string:', materialsString);
    } else if (typeof materials === 'string') {
        materialsString = materials;
        console.log('📦 Using string directly:', materialsString);
    } else {
        console.error('❌ Invalid materials type:', typeof materials);
        return sendError(res, 'Materials must be a string or array', 400);
    }

    // Validate the string
    if (!materialsString.trim()) {
        return sendError(res, 'Materials cannot be empty', 400);
    }

    console.log('📦 Processing materials:', materialsString);
    console.log('🚀 Starting craft generation...');
    console.log('🎨 ============================================\n');

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