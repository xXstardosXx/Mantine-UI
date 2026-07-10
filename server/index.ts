import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { initDatabase } from './db.js';
import authRoutes from './routes/auth.js';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

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
