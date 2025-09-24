import { Router } from "express";
import { verifyChallengeWithUpload } from "../controllers/image.controller";

const router = Router();

router.post("/verify-upload", verifyChallengeWithUpload);


export default router;
