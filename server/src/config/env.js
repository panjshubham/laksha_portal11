import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 3001,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:5173',
};

if (!env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set.");
}
