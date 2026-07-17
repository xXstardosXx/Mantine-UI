import { Router } from 'express';
import { sql } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import type { TaskPriority, TaskStatus } from './types.js';

const router = Router();

function mapTask(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assigneeId: row.assignee_id,
    projectId: row.project_id,
    tags: row.tags,
    dueDate: new Date(row.due_date as string).toISOString().split('T')[0],
    createdAt: new Date(row.created_at as string).toISOString().split('T')[0],
  };
}

router.get('/', authMiddleware, async (_req, res) => {
  try {
    const rows = await sql`
      SELECT id, title, description, status, priority, assignee_id, project_id, tags, due_date, created_at
      FROM tasks
      ORDER BY created_at DESC
    `;
    res.json(rows.map(mapTask));
  } catch (error) {
    console.error('Tasks list error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, assigneeId, projectId, priority, status, tags, dueDate } = req.body as {
      title?: string;
      description?: string;
      assigneeId?: string;
      projectId?: string;
      priority?: TaskPriority;
      status?: TaskStatus;
      tags?: string[];
      dueDate?: string;
    };

    if (!title?.trim() || !description?.trim() || !assigneeId || !projectId || !dueDate) {
      res.status(400).json({ error: 'Faltan campos obligatorios' });
      return;
    }

    const completedAt = status === 'done' ? new Date().toISOString() : null;

    const rows = await sql`
      INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, tags, due_date, completed_at)
      VALUES (
        ${title.trim()},
        ${description.trim()},
        ${status ?? 'todo'},
        ${priority ?? 'medium'},
        ${assigneeId},
        ${projectId},
        ${tags ?? []},
        ${dueDate},
        ${completedAt}
      )
      RETURNING id, title, description, status, priority, assignee_id, project_id, tags, due_date, created_at
    `;

    res.status(201).json(mapTask(rows[0]));
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: TaskStatus };

    if (!status || !['todo', 'in-progress', 'done'].includes(status)) {
      res.status(400).json({ error: 'Estado inválido' });
      return;
    }

    const completedAt = status === 'done' ? new Date().toISOString() : null;

    const rows = await sql`
      UPDATE tasks
      SET status = ${status}, completed_at = ${completedAt}
      WHERE id = ${id}
      RETURNING id, title, description, status, priority, assignee_id, project_id, tags, due_date, created_at
    `;

    if (rows.length === 0) {
      res.status(404).json({ error: 'Tarea no encontrada' });
      return;
    }

    res.json(mapTask(rows[0]));
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
