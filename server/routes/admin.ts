import { Router } from 'express';
import { sql } from '../db.js';
import { adminMiddleware, authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { mapUser } from '../utils.js';
import type { UserRow } from '../db.js';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/users', async (_req, res) => {
  try {
    const rows = await sql`
      SELECT id, email, name, role, avatar, status, phone, bio, department, is_admin, joined_at
      FROM users
      ORDER BY joined_at ASC
    `;

    res.json(rows.map((row) => mapUser(row as UserRow)));
  } catch (error) {
    console.error('Admin users list error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.patch('/users/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, isAdmin } = req.body as { status?: 'active' | 'inactive'; isAdmin?: boolean };

    if (id === req.userId && (status === 'inactive' || isAdmin === false)) {
      res.status(400).json({ error: 'No puedes quitarte permisos de superusuario ni desactivar tu propia cuenta' });
      return;
    }

    const current = await sql`SELECT status, is_admin FROM users WHERE id = ${id} LIMIT 1`;
    if (current.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const nextStatus = status ?? current[0].status;
    const nextIsAdmin = isAdmin ?? current[0].is_admin;

    const rows = await sql`
      UPDATE users
      SET status = ${nextStatus}, is_admin = ${nextIsAdmin}
      WHERE id = ${id}
      RETURNING id, email, name, role, avatar, status, phone, bio, department, is_admin, joined_at
    `;

    res.json(mapUser(rows[0] as UserRow));
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
