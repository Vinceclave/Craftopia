import { Router } from "express";
import { register, login, refreshToken, logout, verifyEmail, requestEmailVerification } from "../controllers/auth.controller";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/verify-email', verifyEmail); // GET because user clicks link
router.post('/resend-verification', requestEmailVerification);

export default router;