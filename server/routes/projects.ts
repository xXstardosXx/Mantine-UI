import { Router } from 'express';
import { sql } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (_req, res) => {
  try {
    const rows = await sql`
      SELECT p.id, p.name, p.status, p.progress, p.budget, p.deadline, p.team_size,
             COALESCE(c.company, 'Sin cliente') AS client
      FROM projects p
      LEFT JOIN clients c ON c.id = p.client_id
      ORDER BY p.created_at DESC
    `;

    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        client: row.client,
        status: row.status,
        progress: row.progress,
        budget: Number(row.budget),
        deadline: new Date(row.deadline as string).toISOString().split('T')[0],
        teamSize: row.team_size,
      })),
    );
  } catch (error) {
    console.error('Projects list error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
