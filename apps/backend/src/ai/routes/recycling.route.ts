// src/routes/recycling.route.ts
import { Router } from "express";
import { detectRecyclingController } from "../controllers/recyling.controller";

const router = Router();
router.post("/detect", detectRecyclingController);
export default router;
