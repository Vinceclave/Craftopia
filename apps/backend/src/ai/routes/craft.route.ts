import { Router } from "express";
import { createCraftFromRecyclables } from "../controllers/craft.controller";

const router = Router();

router.post("/generate", createCraftFromRecyclables);

export default router;
