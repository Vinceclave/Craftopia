// apps/backend/src/ai/controllers/ai.controller.ts - CLEANED VERSION

import { Response, Request } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";
import { generateCraft } from "../services/craft.service";

export const craftController = asyncHandler(async (req: Request, res: Response) => {
    const { materials } = req.body;
    
    if (!materials) {
        return sendError(res, 'Materials field is required', 400);
    }
    
    const result = await generateCraft(materials);
    sendSuccess(res, result, 'Craft ideas generated successfully');
});