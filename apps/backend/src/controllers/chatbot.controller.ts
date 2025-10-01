import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { createChatConversation, createChatMessage, getConversationWithMessages } from "../services/chatbot.service";
import { sendSuccess } from "../utils/response";

// Create conversation
export const handleCreateConversation = asyncHandler(async (req: Request, res: Response) => {
  const { user_id } = req.body;

  const conversation = await createChatConversation({ user_id });

  return sendSuccess(res, conversation, "Conversation ready");
});

// Add message
export const handleCreateMessage = asyncHandler(async (req: Request, res: Response) => {
  const { conversation_id, sender, content } = req.body;

  const message = await createChatMessage({ conversation_id, sender, content });

  return sendSuccess(res, message, "Message created successfully");
});

// Get conversation + messages
export const handleGetConversation = asyncHandler(async (req: Request, res: Response) => {
  const user_id = parseInt(req.params.user_id);

  const conversation = await getConversationWithMessages(user_id);

  return sendSuccess(res, conversation, "Conversation loaded");
});
