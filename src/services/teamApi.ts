import type { User } from '../types';
import { apiRequest } from './apiClient';

export const teamApi = {
  async list(): Promise<User[]> {
    return apiRequest<User[]>('/team');
  },
};
