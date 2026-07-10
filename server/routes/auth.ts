import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { sql } from '../db.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';
import { buildAvatar, mapSettings, mapUser } from '../utils.js';
import type { SettingsRow, UserRow } from '../db.js';

const router = Router();

function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

async function getUserWithSettings(userId: string) {
  const users = await sql`
    SELECT id, email, name, role, avatar, status, phone, bio, department, joined_at
    FROM users WHERE id = ${userId} LIMIT 1
  `;

  if (users.length === 0) return null;

  const settingsRows = await sql`
    SELECT email_notifications, push_notifications, language, color_scheme
    FROM user_settings WHERE user_id = ${userId} LIMIT 1
  `;

  return {
    user: mapUser(users[0] as UserRow),
    settings: mapSettings((settingsRows[0] ?? {
      email_notifications: true,
      push_notifications: false,
      language: 'es',
      color_scheme: 'light',
    }) as SettingsRow),
  };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      department?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await sql`SELECT id FROM users WHERE email = ${normalizedEmail} LIMIT 1`;

    if (existing.length > 0) {
      res.status(409).json({ error: 'Ya existe una cuenta con este correo' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatar = buildAvatar(name.trim());
    const userDepartment = department?.trim() || 'General';

    const inserted = await sql`
      INSERT INTO users (email, password_hash, name, role, avatar, department, bio)
      VALUES (
        ${normalizedEmail},
        ${passwordHash},
        ${name.trim()},
        ${'Usuario'},
        ${avatar},
        ${userDepartment},
        ${''}
      )
      RETURNING id
    `;

    const userId = inserted[0].id as string;

    await sql`INSERT INTO user_settings (user_id) VALUES (${userId})`;

    const payload = await getUserWithSettings(userId);
    if (!payload) {
      res.status(500).json({ error: 'Error al crear el usuario' });
      return;
    }

    res.status(201).json({
      token: signToken(userId),
      ...payload,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const users = await sql`
      SELECT id, email, password_hash, name, role, avatar, status, phone, bio, department, joined_at
      FROM users WHERE email = ${normalizedEmail} LIMIT 1
    `;

    if (users.length === 0) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      return;
    }

    const row = users[0] as UserRow & { password_hash: string };
    const valid = await bcrypt.compare(password, row.password_hash);

    if (!valid) {
      res.status(401).json({ error: 'Correo o contraseña incorrectos' });
      return;
    }

    const payload = await getUserWithSettings(row.id);
    if (!payload) {
      res.status(500).json({ error: 'Error al iniciar sesión' });
      return;
    }

    res.json({
      token: signToken(row.id),
      ...payload,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const payload = await getUserWithSettings(req.userId!);
    if (!payload) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.json(payload);
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/profile', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, phone, bio, department } = req.body as {
      name?: string;
      phone?: string;
      bio?: string;
      department?: string;
    };

    if (!name?.trim()) {
      res.status(400).json({ error: 'El nombre es obligatorio' });
      return;
    }

    const avatar = buildAvatar(name.trim());

    await sql`
      UPDATE users
      SET name = ${name.trim()},
          phone = ${phone?.trim() ?? ''},
          bio = ${bio?.trim() ?? ''},
          department = ${department?.trim() ?? 'General'},
          avatar = ${avatar}
      WHERE id = ${req.userId!}
    `;

    const payload = await getUserWithSettings(req.userId!);
    res.json(payload);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.put('/settings', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { emailNotifications, pushNotifications, language, colorScheme } = req.body as {
      emailNotifications: boolean;
      pushNotifications: boolean;
      language: string;
      colorScheme: string;
    };

    await sql`
      UPDATE user_settings
      SET email_notifications = ${emailNotifications},
          push_notifications = ${pushNotifications},
          language = ${language},
          color_scheme = ${colorScheme}
      WHERE user_id = ${req.userId!}
    `;

    const payload = await getUserWithSettings(req.userId!);
    res.json(payload);
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
