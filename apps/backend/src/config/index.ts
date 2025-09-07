// apps/backend/src/config/index.ts - SIMPLE WORKING VERSION

export const config = {
  port: Number(process.env.PORT) || 3001,

  ai: {
    apiKey: process.env.GOOGLE_API_KEY || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'craftopia-fallback-secret-dev-only',
    accessTokenExpiry: process.env.JWT_EXPIRES_IN || '15m',
    emailTokenExpiry: '24h',
  },
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3001'
  }
};