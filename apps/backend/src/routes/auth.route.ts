import { Router } from "express";
import { register, login, verifyEmail } from "@/controllers/auth.controller";
import passport from '@/config/passport';

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail); // <-- this is critical

// Step 1: Redirect to Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2: Google callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // @ts-ignore
    const { token, user } = req.user;
    // Send JWT to client
    res.json({ token, user });
  }
);


export default router;
