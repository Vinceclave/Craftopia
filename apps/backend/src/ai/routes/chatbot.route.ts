// routes/aiRoutes.ts
import { Router } from "express";
import { handleAIChat } from "../controllers/chatbot.controller";

const router = Router();

// POST /api/ai/chat
router.post("/chat", handleAIChat);

export default router;
