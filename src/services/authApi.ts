import type { AuthUser, LoginCredentials, RegisterCredentials, UserSettings } from '../types';
import { apiRequest, ApiError, tokenStore } from './apiClient';

interface AuthResponse {
  token: string;
  user: AuthUser;
  settings: UserSettings;
}

interface MeResponse {
  user: AuthUser;
  settings: UserSettings;
}

export const authApi = {
  getToken: tokenStore.get,
  setToken: tokenStore.set,

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    tokenStore.set(data.token);
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const data = await apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    tokenStore.set(data.token);
    return data;
  },

  async me(): Promise<MeResponse> {
    return apiRequest<MeResponse>('/auth/me');
  },

  async updateProfile(data: Partial<Pick<AuthUser, 'name' | 'phone' | 'bio' | 'department'>>): Promise<MeResponse> {
    return apiRequest<MeResponse>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateSettings(data: Partial<UserSettings>): Promise<MeResponse> {
    return apiRequest<MeResponse>('/auth/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout() {
    tokenStore.set(null);
  },
};

export { ApiError };
