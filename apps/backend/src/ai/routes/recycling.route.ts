import { Router } from "express";
import { analyzeRecycling } from "../controllers/recycling.controller";

const router = Router();

router.post("/analyze", analyzeRecycling);

export default router;
