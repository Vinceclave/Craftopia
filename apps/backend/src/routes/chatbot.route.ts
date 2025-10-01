import { Router } from "express";
import { handleCreateConversation, handleCreateMessage, handleGetConversation } from "../controllers/chatbot.controller";
import { requireAuth } from "../middlewares/rolebase.middleware";

const router = Router();

// Create or get conversation for a user
router.post("/conversation", requireAuth, handleCreateConversation);

// Add a new message to the conversation
router.post("/message", requireAuth, handleCreateMessage);

// Get conversation with all messages
router.get("/conversation/:user_id", requireAuth, handleGetConversation);

export default router;
