import { Router } from 'express';
import { pool, query } from '../config/db.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { emailService } from '../services/email.service.js';

export const projectsRouter = Router();

// GET /api/projects
projectsRouter.get('/', authMiddleware, async (req, res) => {
  try {
    let sql = `SELECT * FROM projects`;
    const params = [];
    let paramIndex = 1;

    if (req.user.role !== 'admin') {
      const userRes = await query(`SELECT email FROM users WHERE id = $1`, [req.user.id]);
      if (userRes.rows.length > 0) {
        sql += ` WHERE suggester_email = $${paramIndex++}`;
        params.push(userRes.rows[0].email);
      }
    }

    sql += ` ORDER BY updated_at DESC`;
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id
projectsRouter.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM projects WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/projects/:id/draft (Save Progress - no stage change)
projectsRouter.patch('/:id/draft', authMiddleware, async (req, res) => {
  try {
    const { lever, impact, implementability, copq_charges, manpower_savings, investment_cost } = req.body;
    const result = await query(
      `UPDATE projects SET lever = COALESCE($1, lever), 
                           impact = COALESCE($2, impact),
                           implementability = COALESCE($3, implementability),
                           copq_charges = COALESCE($4, copq_charges),
                           manpower_savings = COALESCE($5, manpower_savings),
                           investment_cost = COALESCE($6, investment_cost),
                           updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [lever, impact, implementability, copq_charges, manpower_savings, investment_cost, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/projects/:id/history
projectsRouter.get('/:id/history', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      `SELECT h.from_stage, h.to_stage, h.comments, h.created_at, u.name as actor_name, u.email as actor_email 
       FROM stage_history h 
       LEFT JOIN users u ON h.actor_id = u.id 
       WHERE h.project_id = $1 
       ORDER BY h.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects/:id/submit (Submit for Approval)
projectsRouter.post('/:id/submit', authMiddleware, async (req, res) => {
  const { to_stage, comments } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const projRes = await client.query(`SELECT current_stage, title, suggester_email FROM projects WHERE id = $1`, [req.params.id]);
    if (projRes.rows.length === 0) throw new Error('Project not found');
    const project = projRes.rows[0];
    const from_stage = project.current_stage;

    // Update stage
    await client.query(`UPDATE projects SET current_stage = $1, updated_at = NOW() WHERE id = $2`, [to_stage, req.params.id]);

    // Insert audit log
    await client.query(
      `INSERT INTO stage_history (project_id, from_stage, to_stage, actor_id, comments) VALUES ($1, $2, $3, $4, $5)`,
      [req.params.id, from_stage, to_stage, req.user.id, comments]
    );

    await client.query('COMMIT');

    // Send email outside of transaction so failures don't rollback the transition
    emailService.sendStageChangeEmail(project.suggester_email, project.title, from_stage, to_stage).catch(err => {
      console.error("Failed to send email after stage change:", err);
    });

    res.json({ message: 'Stage advanced successfully', from_stage, to_stage });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/projects/bulk (Grid View Updates)
projectsRouter.patch('/bulk', authMiddleware, async (req, res) => {
  const { updates } = req.body; // array of { id, copq_charges, manpower_savings, investment_cost }
  if (!Array.isArray(updates)) return res.status(400).json({ error: 'Expected updates array' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    for (const update of updates) {
      const copq = parseFloat(update.copq_charges) || 0;
      const mp = parseFloat(update.manpower_savings) || 0;
      const inv = parseFloat(update.investment_cost) || 0;
      
      const actuals = copq + mp;
      const roi = inv > 0 ? (actuals / inv).toFixed(2) : 0;

      await client.query(
        `UPDATE projects SET 
            copq_charges = $1, 
            manpower_savings = $2, 
            investment_cost = $3, 
            monthly_actuals = $4, 
            annualized_roi = $5,
            updated_at = NOW()
         WHERE id = $6`,
        [copq, mp, inv, actuals, roi, update.id]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Bulk update successful' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});
