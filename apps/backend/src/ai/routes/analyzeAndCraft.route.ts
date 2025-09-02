import { Router } from "express";
import { analyzeAndCraft } from "../controllers/analyzeAndCraft.controller";

const router = Router();

router.post("/analyze-and-craft", analyzeAndCraft);

export default router;
