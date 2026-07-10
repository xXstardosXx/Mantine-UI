export type ViewId = 'analytics' | 'kanban' | 'profile' | 'settings';

export type ColorScheme = 'light' | 'dark';

export type AppLanguage = 'es' | 'en';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type ProjectStatus = 'active' | 'paused' | 'completed';

export type ClientPlan = 'starter' | 'professional' | 'enterprise';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  status: 'active' | 'inactive';
  joinedAt: string;
}

export interface AuthUser extends User {
  phone: string;
  bio: string;
  department: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: AppLanguage;
  colorScheme: ColorScheme;
}

export interface AuthSession {
  user: AuthUser;
  loginAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  budget: number;
  deadline: string;
  teamSize: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  projectId: string;
  tags: string[];
  dueDate: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  plan: ClientPlan;
  startDate: string;
}

export interface AnalyticsMetric {
  id: string;
  label: string;
  value: string;
  change: number;
  icon: 'revenue' | 'users' | 'tasks' | 'projects';
}

export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  column: keyof Project;
  direction: SortDirection;
}
