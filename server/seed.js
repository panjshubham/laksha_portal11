import dotenv from 'dotenv';
dotenv.config();

import { query } from './src/config/db.js';
import bcrypt from 'bcrypt';

// Seed password must come from env — set SEED_ADMIN_PASSWORD in server/.env
const seedPassword = process.env.SEED_ADMIN_PASSWORD;
if (!seedPassword) {
  console.error('❌ Set SEED_ADMIN_PASSWORD in server/.env before running seed.js');
  process.exit(1);
}

const hash = await bcrypt.hash(seedPassword, 10);
await query(
  `INSERT INTO users (email, password_hash, name, role, email_verified)
   VALUES ($1, $2, $3, $4, $5)
   ON CONFLICT (email) DO NOTHING`,
  ['admin@lakshya.com', hash, 'Admin', 'admin', true]
);
console.log('Admin user seeded!');

// Seed some sample projects
await query(`
  INSERT INTO projects (title, description, suggester_name, suggester_email, workstream, ebitda_category, current_stage)
  VALUES
    ('Process Automation Initiative', 'Automate manual reporting processes', 'Amit K.', 'amit@lakshya.com', 'Operations', 'Cost Reduction', 'D0'),
    ('Energy Efficiency Project', 'Reduce energy consumption in plant', 'Priya S.', 'priya@lakshya.com', 'Maintenance', 'Cost Reduction', 'D1'),
    ('Scrap Reduction Drive', 'Minimize scrap in production line', 'Rahul V.', 'rahul@lakshya.com', 'Production', 'Cost Reduction', 'D2'),
    ('Digital Twin Implementation', 'Implement digital twin for furnace', 'Sneha M.', 'sneha@lakshya.com', 'Engineering', 'Revenue Growth', 'D3'),
    ('Vendor Consolidation', 'Consolidate vendor base to negotiate better rates', 'Karan T.', 'karan@lakshya.com', 'Procurement', 'Cost Reduction', 'D4')
  ON CONFLICT DO NOTHING
`);
console.log('Sample projects seeded!');
process.exit(0);
