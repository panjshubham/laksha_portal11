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
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://kfsgcftwlsptpcysgchc.supabase.co',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc2djZnR3bHNwdHBjeXNnY2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NzQ1ODcsImV4cCI6MjEwMzI1MDU4N30._YtwONIFbQRG4o0GHa0uzf77AYqbgdwWh900wkiAaBc',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc2djZnR3bHNwdHBjeXNnY2hjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY3NDU4NywiZXhwIjoyMTAzMjUwNTg3fQ.JQKf3XYlPAh3AZ92q4T74S7EBwedYRS-lQCvOzP5Xlo',
  JWT_SECRET: process.env.JWT_SECRET || 'Tem0Q6gW6DnmjVsp5oBEOCyig+Je9OlfvTdrXTZbfXhnuSCV1a6QsDaokRPbdmg5MqKaPDBo7V1p520JlcPJgQ==',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || 'sk6290754634@gmail.com',
  SMTP_PASS: process.env.SMTP_PASS || 'aprw crwe yvnh onpv',
  SMTP_FROM: process.env.SMTP_FROM || 'sk6290754634@gmail.com',
  APP_BASE_URL: process.env.APP_BASE_URL || 'https://lakshaportal.vercel.app',
};

if (!env.DATABASE_URL) {
  console.warn("WARNING: DATABASE_URL is not set.");
}
