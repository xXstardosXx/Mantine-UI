import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconLogout } from '@tabler/icons-react';
import { DEFAULT_SETTINGS } from '../data/mockData';
import { ApiError, authApi } from '../services/authApi';
import type { AuthUser, LoginCredentials, RegisterCredentials, UserSettings } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  settings: UserSettings;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<AuthUser, 'name' | 'phone' | 'bio' | 'department'>>) => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = authApi.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await authApi.me();
        setUser(data.user);
        setSettings(data.settings);
      } catch {
        authApi.logout();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const data = await authApi.login(credentials);
      setUser(data.user);
      setSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      const data = await authApi.register(credentials);
      setUser(data.user);
      setSettings(data.settings);
      return { success: true };
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'No se pudo crear la cuenta';
      return { success: false, error: message };
    }
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
    setSettings(DEFAULT_SETTINGS);

    notifications.show({
      title: 'Sesión cerrada',
      message: 'Has cerrado sesión correctamente. ¡Hasta pronto!',
      color: 'gray',
      icon: <IconLogout size={18} stroke={1.5} />,
    });
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<Pick<AuthUser, 'name' | 'phone' | 'bio' | 'department'>>) => {
      const result = await authApi.updateProfile(data);
      setUser(result.user);
      setSettings(result.settings);

      notifications.show({
        title: 'Perfil actualizado',
        message: 'Tus datos personales se guardaron correctamente.',
        color: 'teal',
        icon: <IconCheck size={18} stroke={1.5} />,
      });
    },
    [],
  );

  const updateSettings = useCallback(async (data: Partial<UserSettings>) => {
    const result = await authApi.updateSettings(data);
    setUser(result.user);
    setSettings(result.settings);

    notifications.show({
      title: 'Configuración guardada',
      message: 'Tus preferencias se aplicaron correctamente.',
      color: 'indigo',
      icon: <IconCheck size={18} stroke={1.5} />,
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      settings,
      isAuthenticated: user !== null,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      updateSettings,
    }),
    [user, settings, isLoading, login, register, logout, updateProfile, updateSettings],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
