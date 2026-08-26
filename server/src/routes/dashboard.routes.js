import { Router } from 'express';
import { query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', authMiddleware, async (req, res) => {
  try {
    let sql = `SELECT current_stage, COUNT(*) as count FROM projects`;
    const params = [];

    // Data Access Scoping
    if (req.user.role !== 'admin') {
      // Find user's workstream or email to scope
      const userRes = await query(`SELECT email FROM users WHERE id = $1`, [req.user.id]);
      if (userRes.rows.length > 0) {
        sql += ` WHERE suggester_email = $1`;
        params.push(userRes.rows[0].email);
      }
    }

    sql += ` GROUP BY current_stage`;
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
