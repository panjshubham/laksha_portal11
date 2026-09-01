import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { emailService } from '../services/email.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const authRouter = Router();

// ============================================================
// 1. SIGN UP (Creates account & triggers verification email)
// ============================================================
authRouter.post('/signup', async (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const assignedRole = role === 'admin' ? 'admin' : (role || 'user');

  try {
    // Check if user already exists
    const existingRes = await query(`SELECT * FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
    const existingUser = existingRes.rows[0];

    let user;

    if (existingUser) {
      if (existingUser.email_verified) {
        return res.status(400).json({ error: 'An account with this email already exists. Please sign in.' });
      }

      // If user exists but is NOT verified, update password/name and resend verification email
      const hash = await bcrypt.hash(password, 10);
      const updateRes = await query(
        `UPDATE users SET password_hash = $1, name = $2, role = $3 
         WHERE id = $4 RETURNING id, email, name, role, email_verified`,
        [hash, cleanName, assignedRole, existingUser.id]
      );
      user = updateRes.rows[0];
    } else {
      const hash = await bcrypt.hash(password, 10);
      const insertRes = await query(
        `INSERT INTO users (email, password_hash, name, role, email_verified) 
         VALUES ($1, $2, $3, $4, false) 
         RETURNING id, email, name, role, email_verified`,
        [cleanEmail, hash, cleanName, assignedRole]
      );
      user = insertRes.rows[0];
    }

    // Create secure 24h email verification token
    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'verify_email' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email via SMTP
    try {
      await emailService.sendVerificationEmail(cleanEmail, token, user.name);
    } catch (emailErr) {
      console.error('Email dispatch error on signup:', emailErr.message);
    }

    res.status(201).json({
      message: 'Account created! A verification link has been sent to your email. Please verify before signing in.',
      email: user.email,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        email_verified: false
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: err.message || 'Error creating account.' });
  }
});

// ============================================================
// 2. VERIFY EMAIL (Validates token & activates account)
// ============================================================
async function handleEmailVerification(req, res) {
  const token = req.query.token || req.body.token;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is required.' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const userId = decoded.id;

    if (!userId) {
      return res.status(400).json({ error: 'Invalid verification token payload.' });
    }

    const result = await query(
      `UPDATE users SET email_verified = true WHERE id = $1 
       RETURNING id, email, name, role, email_verified`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const user = result.rows[0];

    // Issue auth session token for immediate seamless login
    const authToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Email verified successfully! Your account is active.',
      token: authToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        email_verified: true
      }
    });
  } catch (err) {
    console.error('Verify email error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Verification link has expired. Please request a new one.' });
    }
    res.status(400).json({ error: 'Invalid or malformed verification link.' });
  }
}

authRouter.get('/verify', handleEmailVerification);
authRouter.post('/verify', handleEmailVerification);

// ============================================================
// 3. RESEND VERIFICATION EMAIL
// ============================================================
authRouter.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await query(`SELECT * FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    if (user.email_verified) {
      return res.status(400).json({ error: 'This email is already verified. You can sign in directly.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, type: 'verify_email' },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await emailService.sendVerificationEmail(cleanEmail, token, user.name);

    res.json({
      success: true,
      message: `A fresh verification link has been sent to ${cleanEmail}.`
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: err.message || 'Error resending verification email.' });
  }
});

// ============================================================
// 4. LOGIN (Strictly enforces email_verified)
// ============================================================
authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await query(`SELECT * FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // STRICT CHECK: Email MUST be verified before granting access
    if (!user.email_verified) {
      return res.status(403).json({
        error: 'Email address not verified. Please check your inbox and verify your email before signing in.',
        unverified: true,
        email: user.email
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, name: user.name },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        email_verified: true
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Server error during login.' });
  }
});

// ============================================================
// 5. FORGOT PASSWORD (Sends password reset email)
// ============================================================
authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const result = await query(`SELECT * FROM users WHERE LOWER(email) = $1`, [cleanEmail]);
    const user = result.rows[0];

    if (user) {
      const resetToken = jwt.sign(
        { id: user.id, email: user.email, type: 'reset_password' },
        env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      try {
        await emailService.sendPasswordResetEmail(cleanEmail, resetToken, user.name);
      } catch (mailErr) {
        console.error('Forgot password mail error:', mailErr.message);
      }
    }

    // Return generic success to prevent email enumeration
    res.json({
      message: 'If an account exists with this email address, a password reset link has been sent.'
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: err.message || 'Error processing password reset.' });
  }
});

// ============================================================
// 6. RESET PASSWORD (Verifies token & updates password)
// ============================================================
authRouter.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (decoded.type !== 'reset_password' && !decoded.id) {
      return res.status(400).json({ error: 'Invalid password reset token.' });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    const result = await query(
      `UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, email`,
      [hash, decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    res.json({
      success: true,
      message: 'Your password has been reset successfully. You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Password reset link has expired. Please request a new one.' });
    }
    res.status(400).json({ error: 'Invalid or expired password reset link.' });
  }
});

// ============================================================
// 7. CURRENT USER PROFILE (/me)
// ============================================================
authRouter.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, name, role, email_verified, created_at FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
