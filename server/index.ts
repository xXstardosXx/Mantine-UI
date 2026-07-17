import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { initDatabase } from './db.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import teamRoutes from './routes/team.js';
import clientsRoutes from './routes/clients.js';
import projectsRoutes from './routes/projects.js';
import tasksRoutes from './routes/tasks.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/analytics', analyticsRoutes);

async function start() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada');
  }

  await initDatabase();
  console.log('Base de datos PostgreSQL inicializada');

  app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});
