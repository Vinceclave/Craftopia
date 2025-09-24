import { Router } from "express";
import { verifyChallengeWithUpload } from "../controllers/image.controller";
import { requireAuth } from "../../middlewares/rolebase.middleware";

const router = Router();

router.post("/verify-upload", requireAuth, verifyChallengeWithUpload);


export default router;
