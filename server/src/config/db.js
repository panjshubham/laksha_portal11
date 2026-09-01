import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

const DB_URL = env.DATABASE_URL || 'postgresql://postgres:Shubham%40123@db.kfsgcftwlsptpcysgchc.supabase.co:5432/postgres';

export const pool = new Pool({
  connectionString: DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = (text, params) => pool.query(text, params);
