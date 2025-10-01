import { Router } from "express";
import { 
  handleChatWithAI,
  handleGetConversation,
  handleClearConversation,
  handleCreateConversation, 
  handleCreateMessage
} from "../controllers/chatbot.controller";
import { requireAuth } from "../middlewares/rolebase.middleware";

const router = Router();

// ⭐ MAIN ENDPOINTS - Use these for your app
router.post("/chat", requireAuth, handleChatWithAI);           // Send message & get AI response
router.get("/history", requireAuth, handleGetConversation);    // Get full conversation history
router.delete("/clear", requireAuth, handleClearConversation); // Clear conversation

// Legacy endpoints (keep for backward compatibility)
router.post("/conversation", requireAuth, handleCreateConversation);
router.post("/message", requireAuth, handleCreateMessage);
router.get("/conversation/:user_id", requireAuth, handleGetConversation);

export default router;