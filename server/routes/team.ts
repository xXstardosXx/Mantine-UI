import { Router } from 'express';
import { sql } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (_req, res) => {
  try {
    const rows = await sql`
      SELECT id, name, role, avatar, status, joined_at
      FROM team_members
      ORDER BY joined_at ASC
    `;

    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        role: row.role,
        avatar: row.avatar,
        status: row.status,
        joinedAt: new Date(row.joined_at as string).toISOString().split('T')[0],
      })),
    );
  } catch (error) {
    console.error('Team list error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
