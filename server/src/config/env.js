import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from multiple fallback paths:
// 1. Current working directory .env
dotenv.config();
// 2. server/.env relative to cwd
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
// 3. .env relative to server root directory (2 levels up from server/src/config)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
// 4. .env in project root (3 levels up from server/src/config)
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const env = {
  PORT: process.env.PORT || 3001,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:Shubham%40123@db.kfsgcftwlsptpcysgchc.supabase.co:5432/postgres',
  JWT_SECRET: process.env.JWT_SECRET || 'Tem0Q6gW6DnmjVsp5oBEOCyig+Je9OlfvTdrXTZbfXhnuSCV1a6QsDaokRPbdmg5MqKaPDBo7V1p520JlcPJgQ==',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || 'sk6290754634@gmail.com',
  SMTP_PASS: process.env.SMTP_PASS || 'aprw crwe yvnh onpv',
  SMTP_FROM: process.env.SMTP_FROM || 'sk6290754634@gmail.com',
  APP_BASE_URL: process.env.APP_BASE_URL || 'http://localhost:5173',
};

if (!env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set.");
}
