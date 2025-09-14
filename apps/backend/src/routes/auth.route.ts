import { Router } from "express";
import { 
  register, 
  login, 
  refreshToken, 
  logout, 
  verifyEmail, 
  requestEmailVerification,
  changePassword, 
  forgotPassword, 
  resetPassword 
} from "../controllers/auth.controller";
import { validate } from "../utils/validation";
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema, 
  resendVerificationSchema,
  changePasswordSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from "../schemas/auth.schema";
import { requireAuth } from "../middlewares/rolebase.middleware";

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', validate(resendVerificationSchema), requestEmailVerification);

router.post('/change-password', requireAuth, validate(changePasswordSchema), changePassword);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

export default router;
