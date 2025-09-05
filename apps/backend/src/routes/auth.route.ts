import { Router } from "express";
import { 
  register, 
  login, 
  refreshToken, 
  logout, 
  verifyEmail, 
  requestEmailVerification 
} from "../controllers/auth.controller";
import { validate } from "../utils/validation";
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema, 
  resendVerificationSchema 
} from "../schemas/auth.schema";

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), requestEmailVerification);

export default router;
