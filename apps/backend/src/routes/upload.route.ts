import { Router } from "express"
import { uploadImage, uploadMiddleware } from "../controllers/upload.controller"
import { requireAuth } from "../middlewares/rolebase.middleware"

const router = Router()

router.post('/image', requireAuth, uploadImage, uploadImage)

export default router