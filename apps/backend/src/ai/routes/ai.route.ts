import { craftController } from "../controllers/ai.controller";
import { Router } from "express";

const router = Router();

router.post('/generate-craft', craftController);


export default router;