import { Request, Response } from "express";
import { sendSuccess, sendError } from "../../../utils/response";
import { generateAIChallenge } from "./service";

export const generateChallenge = async (req: Request, res: Response) => {
    const data = await generateAIChallenge();

    sendSuccess(res, data, 'Generated successfully');
}

