import { generateCraftSchema } from "../../schemas/ai.schema";
import { validate } from "../../utils/validation";
import { Router } from "express";
import { craftController } from "../controllers/craft.controller";

const router = Router();

router.post('/generate', validate(generateCraftSchema), craftController);


export default router;
