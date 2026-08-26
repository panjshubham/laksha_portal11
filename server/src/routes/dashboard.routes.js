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
    
    const stageCountsRes = await query(sql, params);
    const stageCounts = stageCountsRes.rows;

    // Analytics: Total Active
    let totalActive = 0;
    stageCounts.forEach(r => { totalActive += parseInt(r.count, 10); });

    // Analytics: Completed this month
    let completedSql = `SELECT COUNT(*) FROM projects WHERE current_stage = 'D4' AND date_trunc('month', updated_at) = date_trunc('month', CURRENT_DATE)`;
    const completedParams = [];
    if (req.user.role !== 'admin' && params.length > 0) {
      completedSql += ` AND suggester_email = $1`;
      completedParams.push(params[0]);
    }
    const completedRes = await query(completedSql, completedParams);
    const completedThisMonth = parseInt(completedRes.rows[0].count, 10) || 0;

    // Analytics: Average time in stage
    let avgSql = `
      SELECT AVG(EXTRACT(EPOCH FROM (h2.created_at - h1.created_at))) as avg_seconds
      FROM stage_history h1
      JOIN stage_history h2 ON h1.project_id = h2.project_id AND h1.created_at < h2.created_at
      WHERE NOT EXISTS (
        SELECT 1 FROM stage_history h3 
        WHERE h3.project_id = h1.project_id 
        AND h3.created_at > h1.created_at AND h3.created_at < h2.created_at
      )
    `;
    const avgParams = [];
    if (req.user.role !== 'admin' && params.length > 0) {
      avgSql = `
        SELECT AVG(EXTRACT(EPOCH FROM (h2.created_at - h1.created_at))) as avg_seconds
        FROM stage_history h1
        JOIN stage_history h2 ON h1.project_id = h2.project_id AND h1.created_at < h2.created_at
        JOIN projects p ON p.id = h1.project_id
        WHERE p.suggester_email = $1 AND NOT EXISTS (
          SELECT 1 FROM stage_history h3 
          WHERE h3.project_id = h1.project_id 
          AND h3.created_at > h1.created_at AND h3.created_at < h2.created_at
        )
      `;
      avgParams.push(params[0]);
    }
    const avgRes = await query(avgSql, avgParams);
    const avgSeconds = parseFloat(avgRes.rows[0].avg_seconds) || 0;
    const avgTimeInStage = Math.round(avgSeconds / 86400); // converting seconds to days

    res.json({
      stageCounts,
      analytics: {
        totalActive,
        completedThisMonth,
        avgTimeInStage
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
