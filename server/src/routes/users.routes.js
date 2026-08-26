import { Router } from 'express';
import bcrypt from 'bcrypt';
import { pool, query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const usersRouter = Router();

// GET /api/users/me
usersRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/me
usersRouter.patch('/me', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const result = await query(
      `UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role, created_at`,
      [name.trim(), req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/me/password
usersRouter.patch('/me/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  try {
    const result = await query(`SELECT password_hash FROM users WHERE id = $1`, [req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = result.rows[0];
    
    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Incorrect current password' });
    
    // Check if new password is the same
    const matchNew = await bcrypt.compare(newPassword, user.password_hash);
    if (matchNew) return res.status(400).json({ error: 'New password cannot be the same as current password' });

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    
    await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, req.user.id]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
