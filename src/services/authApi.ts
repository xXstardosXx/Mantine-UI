import type { AuthUser, LoginCredentials, RegisterCredentials, UserSettings } from '../types';

const TOKEN_KEY = 'saasflow_token';

interface AuthResponse {
  token: string;
  user: AuthUser;
  settings: UserSettings;
}

interface MeResponse {
  user: AuthUser;
  settings: UserSettings;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api/auth${path}`, {
    ...options,
    headers,
  });

  const data = (await response.json()) as T & { error?: string };

  if (!response.ok) {
    throw new ApiError(data.error ?? 'Error en la solicitud', response.status);
  }

  return data;
}

export const authApi = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string | null) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.token);
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.token);
    return data;
  },

  async me(): Promise<MeResponse> {
    return request<MeResponse>('/me');
  },

  async updateProfile(data: Partial<Pick<AuthUser, 'name' | 'phone' | 'bio' | 'department'>>): Promise<MeResponse> {
    return request<MeResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateSettings(data: Partial<UserSettings>): Promise<MeResponse> {
    return request<MeResponse>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout() {
    this.setToken(null);
  },
};

export { ApiError };
