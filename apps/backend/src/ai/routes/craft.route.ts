// src/routes/craft.route.ts
import { Router } from "express";
import { generateCraftController } from "../controllers/craft.controller";

const router = Router();
router.post("/generate", generateCraftController);
export default router;
