// apps/backend/src/routes/auth.route.ts - Updated with mobile Google auth
import { Router } from "express";
import { register, login, verifyEmail, googleMobileAuth } from "@/controllers/auth.controller";
import passport from '@/config/passport';

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);

// Mobile Google authentication endpoint
router.post("/google/mobile", googleMobileAuth);

// Web Google OAuth (existing)
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // @ts-ignore
    const { token, user } = req.user;
    res.json({ token, user });
  }
);

export default router;  