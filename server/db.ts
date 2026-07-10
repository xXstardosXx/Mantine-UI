import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

export const sql = neon(process.env.DATABASE_URL!);

export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL DEFAULT 'Usuario',
      avatar VARCHAR(10) NOT NULL DEFAULT 'US',
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      phone VARCHAR(50) NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      department VARCHAR(100) NOT NULL DEFAULT 'General',
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      email_notifications BOOLEAN NOT NULL DEFAULT true,
      push_notifications BOOLEAN NOT NULL DEFAULT false,
      language VARCHAR(5) NOT NULL DEFAULT 'es',
      color_scheme VARCHAR(10) NOT NULL DEFAULT 'light'
    )
  `;

  const demoEmail = 'demo@gmail.com';
  const existing = await sql`SELECT id FROM users WHERE email = ${demoEmail} LIMIT 1`;

  if (existing.length === 0) {
    const passwordHash = await bcrypt.hash('Demo123', 10);
    const rows = await sql`
      INSERT INTO users (email, password_hash, name, role, avatar, phone, bio, department)
      VALUES (
        ${demoEmail},
        ${passwordHash},
        ${'Usuario Demo'},
        ${'Product Manager'},
        ${'UD'},
        ${''},
        ${'Cuenta de demostración de SaaSFlow.'},
        ${'Producto'}
      )
      RETURNING id
    `;

    await sql`
      INSERT INTO user_settings (user_id)
      VALUES (${rows[0].id})
    `;
  }
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  phone: string;
  bio: string;
  department: string;
  joined_at: string;
}

export interface SettingsRow {
  email_notifications: boolean;
  push_notifications: boolean;
  language: string;
  color_scheme: string;
}
