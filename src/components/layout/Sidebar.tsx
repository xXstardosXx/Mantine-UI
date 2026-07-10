import { NavLink, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconChartBar, IconLayoutKanban } from '@tabler/icons-react';
import type { ViewId } from '../../types';

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
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

export function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <Stack gap="xs" p="md" component="nav" aria-label="Navegación principal">
      <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs" px="sm">
        Módulos
      </Text>

      {NAV_ITEMS.map((item) => {
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
            aria-current={isActive ? 'page' : undefined}
          />
        );
      })}
    </Stack>
  );
}
