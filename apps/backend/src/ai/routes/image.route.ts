import { Router } from "express";
import { imageRecognition } from "../controllers/image.controller";

const router = Router();

router.post("/analyze", imageRecognition);


export default router;
