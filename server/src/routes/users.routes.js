import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { emailService } from '../services/email.service.js';

export const usersRouter = Router();

// GET /api/users/me (Current authenticated user profile)
usersRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, email, role, email_verified, created_at, updated_at FROM users WHERE id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/me (Update current profile)
usersRouter.patch('/me', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    const result = await query(
      `UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2 
       RETURNING id, name, email, role, email_verified, created_at, updated_at`,
      [name.trim(), req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/me/password (Change password)
usersRouter.patch('/me/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password are required' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
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
    
    await query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [newHash, req.user.id]);
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ADMIN USER MANAGEMENT ENDPOINTS
// ============================================================

// GET /api/users (Admin: List all users with project counts)
usersRouter.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.role, 
        u.email_verified, 
        u.created_at, 
        u.updated_at,
        COUNT(p.id) as project_count
      FROM users u
      LEFT JOIN projects p ON p.suggester_email = u.email OR p.owner_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id/role (Admin: Change user role)
usersRouter.patch('/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  const { role } = req.body;
  const validRoles = ['admin', 'user', 'member', 'approver', 'customer', 'lead'];
  
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  try {
    const result = await query(
      `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 
       RETURNING id, email, name, role, email_verified`,
      [role, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: `Role updated to ${role}`, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id/verify (Admin: Manually toggle verification status)
usersRouter.patch('/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
  const { verified } = req.body;
  const isVerified = verified !== undefined ? Boolean(verified) : true;

  try {
    const result = await query(
      `UPDATE users SET email_verified = $1, updated_at = NOW() WHERE id = $2 
       RETURNING id, email, name, role, email_verified`,
      [isVerified, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: `Email verification set to ${isVerified}`, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/:id/resend-verification (Admin: Dispatch verification email to a user)
usersRouter.post('/:id/resend-verification', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await query(`SELECT id, email, name, email_verified FROM users WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'verify_email' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await emailService.sendVerificationEmail(user.email, token, user.name);
    res.json({ message: `Verification email sent to ${user.email}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id (Admin: Delete user)
usersRouter.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own admin account.' });
  }

  try {
    const result = await query(`DELETE FROM users WHERE id = $1 RETURNING id, email`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: `User ${result.rows[0].email} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
