import * as chatbotController from "../controllers/chatbot.controller";
import { chatMessageSchema } from "../schemas/chatbot.schema";
import { Router } from "express";
import { validate } from "../utils/validation";
import { requireAuth } from "../middlewares/rolebase.middleware";

const chatbotRouter = Router();

// Main endpoints
chatbotRouter.post(
  "/chat",
  requireAuth,
  validate(chatMessageSchema),
  chatbotController.handleChatWithAI
);

chatbotRouter.get(
  "/history",
  requireAuth,
  chatbotController.handleGetConversation
);

chatbotRouter.delete(
  "/clear",
  requireAuth,
  chatbotController.handleClearConversation
);

export default chatbotRouter;