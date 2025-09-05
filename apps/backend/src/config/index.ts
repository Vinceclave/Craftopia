export const config = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    accessTokenExpiry: process.env.JWT_EXPIRES_IN || '15m',
    emailTokenExpiry: '24h',
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  email: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  }
} as const;
