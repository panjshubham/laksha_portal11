import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool, query } from '../config/db.js';
import { env } from '../config/env.js';
import { emailService } from '../services/email.service.js';

export const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name`,
      [email, hash, name]
    );
    const user = result.rows[0];
    
    // Create verify token
    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, { expiresIn: '1h' });
    await emailService.sendVerificationEmail(email, token);
    
    res.status(201).json({ message: 'User created. Please verify your email.', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
