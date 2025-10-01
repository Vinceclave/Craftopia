import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/response";
import { chatAiResponse } from "../services/chatbot.service";

export const handleAIChat = asyncHandler(async (req: Request, res: Response) => {
  const { message } = req.body;

  const answer = await chatAiResponse(message); // will throw AppError if invalid

  return sendSuccess(res, {
    message: answer,
    timestamp: new Date().toISOString(),
  }, "Response generated successfully");
});