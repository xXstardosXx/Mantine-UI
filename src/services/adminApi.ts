import type { AuthUser } from '../types';
import { apiRequest } from './apiClient';

export const adminApi = {
  async listUsers(): Promise<AuthUser[]> {
    return apiRequest<AuthUser[]>('/admin/users');
  },

  async updateUser(userId: string, data: { status?: 'active' | 'inactive'; isAdmin?: boolean }): Promise<AuthUser> {
    return apiRequest<AuthUser>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
