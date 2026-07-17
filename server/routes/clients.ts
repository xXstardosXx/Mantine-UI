import { Router } from 'express';
import { sql } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import type { ClientPlan } from './types.js';

const router = Router();

const PROJECT_BUDGET_BY_PLAN: Record<ClientPlan, number> = {
  starter: 20000,
  professional: 45000,
  enterprise: 80000,
};

function mapClient(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    plan: row.plan,
    startDate: new Date(row.start_date as string).toISOString().split('T')[0],
  };
}

function mapProject(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    client: row.client_company ?? '',
    status: row.status,
    progress: row.progress,
    budget: Number(row.budget),
    deadline: new Date(row.deadline as string).toISOString().split('T')[0],
    teamSize: row.team_size,
  };
}

router.get('/', authMiddleware, async (_req, res) => {
  try {
    const rows = await sql`SELECT id, name, email, company, plan, start_date FROM clients ORDER BY created_at DESC`;
    res.json(rows.map(mapClient));
  } catch (error) {
    console.error('Clients list error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, email, company, plan, startDate } = req.body as {
      name?: string;
      email?: string;
      company?: string;
      plan?: ClientPlan;
      startDate?: string;
    };

    if (!name?.trim() || !email?.trim() || !company?.trim() || !plan || !startDate) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    const clientRows = await sql`
      INSERT INTO clients (name, email, company, plan, start_date)
      VALUES (${name.trim()}, ${email.trim()}, ${company.trim()}, ${plan}, ${startDate})
      RETURNING id, name, email, company, plan, start_date
    `;
    const client = clientRows[0];

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 90);

    const projectRows = await sql`
      INSERT INTO projects (name, client_id, status, progress, budget, deadline, team_size)
      VALUES (
        ${`Proyecto — ${company.trim()}`},
        ${client.id},
        ${'active'},
        ${0},
        ${PROJECT_BUDGET_BY_PLAN[plan]},
        ${deadline.toISOString().split('T')[0]},
        ${3}
      )
      RETURNING id, name, status, progress, budget, deadline, team_size
    `;
    const project = { ...projectRows[0], client_company: client.company };

    res.status(201).json({
      client: mapClient(client),
      project: mapProject(project),
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
