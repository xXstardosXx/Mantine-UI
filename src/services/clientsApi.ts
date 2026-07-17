import type { Client, Project } from '../types';
import { apiRequest } from './apiClient';

export const clientsApi = {
  async list(): Promise<Client[]> {
    return apiRequest<Client[]>('/clients');
  },

  async create(client: Omit<Client, 'id'>): Promise<{ client: Client; project: Project }> {
    return apiRequest<{ client: Client; project: Project }>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
  },
};
