import { NavLink, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconChartBar, IconLayoutKanban, IconShieldCheck } from '@tabler/icons-react';
import type { ViewId } from '../../types';
import classes from './Sidebar.module.css';

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
  isAdmin: boolean;
}

const NAV_ITEMS: { id: ViewId; label: string; description: string; icon: typeof IconChartBar }[] = [
  {
    id: 'analytics',
    label: 'Dashboard de Analítica',
    description: 'Métricas y proyectos',
    icon: IconChartBar,
  },
  {
    id: 'kanban',
    label: 'Tablero Kanban',
    description: 'Gestión de tareas',
    icon: IconLayoutKanban,
  },
];

const ADMIN_NAV_ITEM = {
  id: 'users' as const,
  label: 'Gestión de Usuarios',
  description: 'Solo superusuarios',
  icon: IconShieldCheck,
};

export function Sidebar({ activeView, onNavigate, isAdmin }: SidebarProps) {
  const items = isAdmin ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS;

  return (
    <Stack gap="xs" p="md" component="nav" aria-label="Navegación principal">
      <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs" px="sm">
        Módulos
      </Text>

      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <NavLink
            key={item.id}
            label={item.label}
            description={item.description}
            leftSection={
              <ThemeIcon variant={isActive ? 'filled' : 'light'} color="indigo" size="md" aria-hidden="true">
                <Icon size={18} stroke={1.5} />
              </ThemeIcon>
            }
            active={isActive}
            onClick={() => onNavigate(item.id)}
            variant="filled"
            className={classes.link}
            aria-current={isActive ? 'page' : undefined}
          />
        );
      })}
    </Stack>
  );
}
