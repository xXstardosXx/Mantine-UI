export type ClientPlan = 'starter' | 'professional' | 'enterprise';
export type ProjectStatus = 'active' | 'paused' | 'completed';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export const PLAN_MONTHLY_PRICE: Record<ClientPlan, number> = {
  starter: 29,
  professional: 79,
  enterprise: 199,
};
