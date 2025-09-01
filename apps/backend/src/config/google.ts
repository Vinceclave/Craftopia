import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './prisma';
import { signToken } from '@/utils/jwt';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) throw new Error('No email from Google');

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              username: profile.displayName.replace(/\s+/g, '').toLowerCase(),
              email,
              google_id: profile.id,
              is_email_verified: true,
            },
          });
        } else if (!user.google_id) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { google_id: profile.id, is_email_verified: true },
          });
        }

        const token = signToken(user);
        done(null, { user, token });
      } catch (err) {
        done(err as any, null as never);
      }
    }
  )
);
