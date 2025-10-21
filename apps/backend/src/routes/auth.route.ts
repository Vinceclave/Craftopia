import { Router } from "express";
import * as authController from "../controllers/auth.controller";
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

// Public routes
router.post(
  '/register', 
  validate(registerSchema), 
  authController.register
);

router.post(
  '/login', 
  validate(loginSchema), 
  authController.login
);

router.post(
  '/refresh-token', 
  validate(refreshTokenSchema), 
  authController.refreshToken
);

router.post(
  '/logout', 
  authController.logout
);

router.get(
  '/verify-email', 
  authController.verifyEmail
);

router.post(
  '/resend-verification', 
  validate(resendVerificationSchema), 
  authController.requestEmailVerification
);

router.post(
  '/forgot-password', 
  validate(forgotPasswordSchema), 
  authController.forgotPassword
);

router.post(
  '/reset-password', 
  validate(resetPasswordSchema), 
  authController.resetPassword
);

// Protected routes
router.post(
  '/change-password', 
  requireAuth, 
  validate(changePasswordSchema), 
  authController.changePassword
);

export default router;