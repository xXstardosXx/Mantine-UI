import { Router } from 'express';
import { sql } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { PLAN_MONTHLY_PRICE } from './types.js';
import type { ClientPlan } from './types.js';

const router = Router();

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function pctChange(current: number, before: number): number {
  if (before === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - before) / before) * 1000) / 10;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-MX').format(value);
}

router.get('/metrics', authMiddleware, async (_req, res) => {
  try {
    const now = Date.now();
    const cutoff = new Date(now - THIRTY_DAYS_MS);

    const clientRows = await sql`SELECT plan, start_date FROM clients`;
    const taskRows = await sql`SELECT status, completed_at, created_at FROM tasks`;
    const projectRows = await sql`SELECT status, budget, created_at FROM projects`;

    let revenueCurrent = 0;
    let revenueBefore = 0;
    let clientsCurrent = 0;
    let clientsBefore = 0;

    for (const row of clientRows) {
      const price = PLAN_MONTHLY_PRICE[row.plan as ClientPlan] ?? 0;
      const startDate = new Date(row.start_date as string);
      revenueCurrent += price;
      clientsCurrent += 1;
      if (startDate <= cutoff) {
        revenueBefore += price;
        clientsBefore += 1;
      }
    }

    let tasksDoneCurrent = 0;
    let tasksDoneBefore = 0;
    let pendingTasks = 0;

    for (const row of taskRows) {
      if (row.status !== 'done') {
        pendingTasks += 1;
        continue;
      }
      tasksDoneCurrent += 1;
      const completedAt = row.completed_at ? new Date(row.completed_at as string) : null;
      if (completedAt && completedAt <= cutoff) {
        tasksDoneBefore += 1;
      }
    }

    let activeProjectsCurrent = 0;
    let activeProjectsBefore = 0;
    let activeBudget = 0;

    for (const row of projectRows) {
      if (row.status !== 'active') continue;
      activeBudget += Number(row.budget);
      activeProjectsCurrent += 1;
      const createdAt = new Date(row.created_at as string);
      if (createdAt <= cutoff) {
        activeProjectsBefore += 1;
      }
    }

    const newClients30d = clientRows.filter((row) => new Date(row.start_date as string) > cutoff).length;
    const totalTasks = taskRows.length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((tasksDoneCurrent / totalTasks) * 1000) / 10;

    res.json({
      metrics: [
        {
          id: 'm1',
          label: 'Ingresos Mensuales',
          value: formatCurrency(revenueCurrent),
          change: pctChange(revenueCurrent, revenueBefore),
          icon: 'revenue',
        },
        {
          id: 'm2',
          label: 'Clientes Activos',
          value: formatNumber(clientsCurrent),
          change: pctChange(clientsCurrent, clientsBefore),
          icon: 'users',
        },
        {
          id: 'm3',
          label: 'Tareas Completadas',
          value: formatNumber(tasksDoneCurrent),
          change: pctChange(tasksDoneCurrent, tasksDoneBefore),
          icon: 'tasks',
        },
        {
          id: 'm4',
          label: 'Proyectos Activos',
          value: formatNumber(activeProjectsCurrent),
          change: pctChange(activeProjectsCurrent, activeProjectsBefore),
          icon: 'projects',
        },
      ],
      summary: {
        newClients: newClients30d,
        taskCompletionRate: completionRate,
        pendingTasks,
        activeBudget,
      },
    });
  } catch (error) {
    console.error('Analytics metrics error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
