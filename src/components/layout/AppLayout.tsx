import { AppShell, Center, Loader, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import type { ReactNode } from 'react';
import type { AuthUser, ViewId } from '../../types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  activeView: ViewId;
  user: AuthUser;
  onNavigate: (view: ViewId) => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  children: ReactNode;
}

export function AppLayout({
  activeView,
  user,
  onNavigate,
  onOpenProfile,
  onOpenSettings,
  onLogout,
  children,
}: AppLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();

  const handleNavigate = (view: ViewId) => {
    onNavigate(view);
    if (mobileOpened) {
      toggleMobile();
    }
  };

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Header
          activeView={activeView}
          user={user}
          mobileOpened={mobileOpened}
          onToggleMobile={toggleMobile}
          onOpenProfile={onOpenProfile}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
        />
      </AppShell.Header>

      <AppShell.Navbar p={0}>
        <AppShell.Section grow>
          <Sidebar activeView={activeView} onNavigate={handleNavigate} />
        </AppShell.Section>
        <AppShell.Section p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
          <Text size="xs" c="dimmed" ta="center">
            SaaSFlow v1.0 — Demo Universitaria
          </Text>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main component="main">{children}</AppShell.Main>
    </AppShell>
  );
}

export function AuthLoadingScreen() {
  return (
    <Center mih="100vh" role="status" aria-label="Cargando sesión">
      <Loader color="indigo" size="lg" />
    </Center>
  );
}
