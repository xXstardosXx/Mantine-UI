import {
  Anchor,
  Avatar,
  Breadcrumbs,
  Burger,
  Button,
  Group,
  Menu,
  Modal,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconUser,
} from '@tabler/icons-react';
import type { AuthUser, ViewId } from '../../types';

interface HeaderProps {
  activeView: ViewId;
  user: AuthUser;
  mobileOpened: boolean;
  onToggleMobile: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}

const VIEW_LABELS: Record<ViewId, string> = {
  analytics: 'Dashboard de Analítica',
  kanban: 'Tablero Kanban',
  profile: 'Mi Perfil',
  settings: 'Configuración',
  users: 'Gestión de Usuarios',
};

export function Header({
  activeView,
  user,
  mobileOpened,
  onToggleMobile,
  onOpenProfile,
  onOpenSettings,
  onLogout,
}: HeaderProps) {
  const [logoutOpened, { open: openLogout, close: closeLogout }] = useDisclosure(false);

  const breadcrumbItems = [
    { title: 'SaaSFlow', href: '#' },
    { title: 'Panel de Gestión', href: '#' },
    { title: VIEW_LABELS[activeView], href: '#' },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} size="sm" onClick={(event) => event.preventDefault()}>
      {item.title}
    </Anchor>
  ));

  const handleConfirmLogout = () => {
    closeLogout();
    onLogout();
  };

  return (
    <>
      <Group h="100%" px="md" justify="space-between">
        <Group gap="md">
          <Burger
            opened={mobileOpened}
            onClick={onToggleMobile}
            hiddenFrom="sm"
            size="sm"
            aria-label={mobileOpened ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
          />
          <Breadcrumbs separator="→" aria-label="Ruta de navegación">
            {breadcrumbItems}
          </Breadcrumbs>
        </Group>

        <Menu position="bottom-end" withinPortal shadow="md" width={220}>
          <Menu.Target>
            <UnstyledButton aria-label="Menú de perfil de usuario">
              <Group gap="xs">
                <Avatar color="indigo" radius="xl" size="md" aria-hidden="true">
                  {user.avatar}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={600} lh={1.2}>
                    {user.name}
                  </Text>
                  <Text size="xs" c="dimmed" lh={1.2}>
                    {user.role}
                  </Text>
                </div>
                <IconChevronDown size={14} stroke={1.5} aria-hidden="true" />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Cuenta</Menu.Label>
            <Menu.Item
              leftSection={<IconUser size={16} stroke={1.5} />}
              onClick={onOpenProfile}
            >
              Mi Perfil
            </Menu.Item>
            <Menu.Item
              leftSection={<IconSettings size={16} stroke={1.5} />}
              onClick={onOpenSettings}
            >
              Configuración
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item
              leftSection={<IconLogout size={16} stroke={1.5} />}
              color="red"
              onClick={openLogout}
            >
              Cerrar Sesión
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Modal
        opened={logoutOpened}
        onClose={closeLogout}
        title="Cerrar sesión"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            ¿Estás seguro de que deseas cerrar sesión, <strong>{user.name}</strong>?
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeLogout}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleConfirmLogout} leftSection={<IconLogout size={16} stroke={1.5} />}>
              Cerrar Sesión
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
