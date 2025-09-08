import { generateCraftSchema } from "../../schemas/ai.schema";
import { validate } from "../../utils/validation";
import { craftController } from "../controllers/craft.controller";
import { Router } from "express";

const router = Router();

router.post('/generate-craft', validate(generateCraftSchema), craftController);


export default router;