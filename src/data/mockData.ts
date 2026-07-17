import type { UserSettings } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  emailNotifications: true,
  pushNotifications: false,
  language: 'es',
  colorScheme: 'light',
};

export const TAG_OPTIONS = [
  { value: 'design', label: 'Diseño' },
  { value: 'ux', label: 'UX' },
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'devops', label: 'DevOps' },
  { value: 'testing', label: 'Testing' },
  { value: 'security', label: 'Seguridad' },
  { value: 'docs', label: 'Documentación' },
  { value: 'api', label: 'API' },
  { value: 'database', label: 'Base de Datos' },
  { value: 'performance', label: 'Rendimiento' },
  { value: 'a11y', label: 'Accesibilidad' },
];

export const KANBAN_COLUMNS = [
  { id: 'todo' as const, title: 'Por Hacer', color: 'gray' },
  { id: 'in-progress' as const, title: 'En Progreso', color: 'blue' },
  { id: 'done' as const, title: 'Completado', color: 'green' },
];
