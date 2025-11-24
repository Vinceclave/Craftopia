// apps/backend/src/ai/controllers/ai.controller.ts

import { Response, Request } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";
import { generateCraft } from "../services/craft.service";

export const craftController = asyncHandler(async (req: Request, res: Response) => {
    const { materials } = req.body;
    
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
    
    const result = await generateCraft(materialsString);
    sendSuccess(res, result, 'Craft ideas generated successfully');
});