const requiredEnvVars = [
  'GOOGLE_API_KEY',
  'DATABASE_URL',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file');
  process.exit(1);
}

export const config = {
  port: Number(process.env.PORT) || 3001,

  ai: {
    apiKey: process.env.GOOGLE_API_KEY!,
    model: process.env.AI_MODEL || 'gemini-1.5-flash',
    maxFileSize: 10 * 1024 * 1024, // 10MB
  },
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    accessTokenExpiry: process.env.JWT_EXPIRES_IN || '15m',
    emailTokenExpiry: '24h',
  },
  
  database: {
    url: process.env.DATABASE_URL!,
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