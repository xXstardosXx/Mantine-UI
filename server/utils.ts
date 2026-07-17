import type { SettingsRow, UserRow } from './db.js';

export interface AuthUserDto {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  status: 'active' | 'inactive';
  phone: string;
  bio: string;
  department: string;
  isAdmin: boolean;
  joinedAt: string;
}

export interface UserSettingsDto {
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: 'es' | 'en';
  colorScheme: 'light' | 'dark';
}

export function buildAvatar(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function mapUser(row: UserRow): AuthUserDto {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    avatar: row.avatar,
    status: row.status as AuthUserDto['status'],
    phone: row.phone,
    bio: row.bio,
    department: row.department,
    isAdmin: row.is_admin,
    joinedAt: new Date(row.joined_at).toISOString().split('T')[0],
  };
}

export function mapSettings(row: SettingsRow): UserSettingsDto {
  return {
    emailNotifications: row.email_notifications,
    pushNotifications: row.push_notifications,
    language: row.language as UserSettingsDto['language'],
    colorScheme: row.color_scheme as UserSettingsDto['colorScheme'],
  };
}
