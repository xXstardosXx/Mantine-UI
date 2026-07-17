import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sql } from '../db.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No autorizado' });
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export async function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const rows = await sql`SELECT is_admin FROM users WHERE id = ${req.userId!} LIMIT 1`;

  if (rows.length === 0 || !rows[0].is_admin) {
    res.status(403).json({ error: 'Requiere permisos de superusuario' });
    return;
  }

  next();
}
