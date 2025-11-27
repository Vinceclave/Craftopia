// apps/backend/src/ai/controllers/craft.controller.ts

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
    console.log('🖼️  Has referenceImageBase64:', !!referenceImageBase64);
    console.log('📏 Type of referenceImageBase64:', typeof referenceImageBase64);
    
    if (referenceImageBase64) {
        const imageLength = referenceImageBase64.length;
        const imageSizeMB = (imageLength / (1024 * 1024)).toFixed(2);
        console.log('📊 Reference Image Length:', imageLength, 'characters');
        console.log('📊 Reference Image Size:', imageSizeMB, 'MB');
        console.log('🔍 Reference Image Preview (first 100 chars):', referenceImageBase64.substring(0, 100));
        
        // Check if it has proper data URI prefix
        if (referenceImageBase64.startsWith('data:image')) {
            console.log('✅ Image has proper data URI prefix');
        } else {
            console.log('⚠️  Image missing data URI prefix');
        }
    } else {
        console.log('❌ referenceImageBase64 is:', referenceImageBase64);
        console.log('⚠️  WARNING: No reference image provided - images will be generated without visual reference');
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
    
    console.log('📦 Processing materials:', materialsString);
    console.log('🚀 Starting craft generation...');
    console.log('🎨 ============================================\n');
    
    const result = await generateCraft(materialsString, referenceImageBase64);
    sendSuccess(res, result, 'Craft ideas generated successfully');
});