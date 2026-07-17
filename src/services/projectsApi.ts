import type { Project } from '../types';
import { apiRequest } from './apiClient';

export const projectsApi = {
  async list(): Promise<Project[]> {
    return apiRequest<Project[]>('/projects');
  },
};
