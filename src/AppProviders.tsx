import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import { useAuth } from './context/AuthContext';
import { theme } from './theme';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import 'dayjs/locale/es';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const { settings } = useAuth();

  return (
    <MantineProvider theme={theme} defaultColorScheme={settings.colorScheme} forceColorScheme={settings.colorScheme}>
      <DatesProvider settings={{ locale: settings.language === 'es' ? 'es' : 'en', firstDayOfWeek: 1 }}>
        <Notifications position="top-right" zIndex={2000} />
        {children}
      </DatesProvider>
    </MantineProvider>
  );
}
