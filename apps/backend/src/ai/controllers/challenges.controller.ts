import { Request, Response } from "express";
import { sendSuccess, sendError } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";
import { generateChallenge } from "../services/challenges.service";

export const generateChallenges = asyncHandler(async (req: Request, res: Response) => {
    
    const result = await generateChallenge();
    sendSuccess(res, result, 'Challenges successfully generated');

})
