import type { Task, TaskStatus } from '../types';
import { apiRequest } from './apiClient';

export const tasksApi = {
  async list(): Promise<Task[]> {
    return apiRequest<Task[]>('/tasks');
  },

  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    return apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  },

  async updateStatus(taskId: string, status: TaskStatus): Promise<Task> {
    return apiRequest<Task>(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
