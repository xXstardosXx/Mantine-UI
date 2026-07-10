import {
  ActionIcon,
  Badge,
  Card,
  Group,
  Menu,
  Text,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCalendar,
  IconDots,
} from '@tabler/icons-react';
import type { Task, TaskStatus, User } from '../../types';

const PRIORITY_COLORS: Record<Task['priority'], string> = {
  low: 'gray',
  medium: 'blue',
  high: 'orange',
  critical: 'red',
};

const PRIORITY_LABELS: Record<Task['priority'], string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

const STATUS_ORDER: TaskStatus[] = ['todo', 'in-progress', 'done'];

interface KanbanCardProps {
  task: Task;
  assignee?: User;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
}

export function KanbanCard({ task, assignee, onMove }: KanbanCardProps) {
  const currentIndex = STATUS_ORDER.indexOf(task.status);
  const canMoveLeft = currentIndex > 0;
  const canMoveRight = currentIndex < STATUS_ORDER.length - 1;

  const handleMove = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    onMove(task.id, STATUS_ORDER[newIndex]);
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' }).format(new Date(date));

  return (
    <Card
      shadow="sm"
      radius="md"
      padding="sm"
      withBorder
      role="article"
      aria-label={`Tarea: ${task.title}`}
    >
      <Group justify="space-between" align="flex-start" mb="xs" wrap="nowrap">
        <Text fw={600} size="sm" lineClamp={2} style={{ flex: 1 }}>
          {task.title}
        </Text>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Opciones de tarea">
              <IconDots size={14} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>Mover tarea</Menu.Label>
            {canMoveLeft && (
              <Menu.Item
                leftSection={<IconArrowLeft size={14} stroke={1.5} />}
                onClick={() => handleMove('left')}
              >
                Mover a columna anterior
              </Menu.Item>
            )}
            {canMoveRight && (
              <Menu.Item
                leftSection={<IconArrowRight size={14} stroke={1.5} />}
                onClick={() => handleMove('right')}
              >
                Mover a columna siguiente
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Text size="xs" c="dimmed" lineClamp={2} mb="sm">
        {task.description}
      </Text>

      <Group gap={4} mb="sm">
        {task.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} size="xs" variant="outline" color="indigo">
            {tag}
          </Badge>
        ))}
      </Group>

      <Group justify="space-between" align="center">
        <Badge color={PRIORITY_COLORS[task.priority]} variant="light" size="sm">
          {PRIORITY_LABELS[task.priority]}
        </Badge>
        <Group gap={4}>
          <IconCalendar size={12} stroke={1.5} aria-hidden="true" />
          <Text size="xs" c="dimmed">
            {formatDate(task.dueDate)}
          </Text>
        </Group>
      </Group>

      {assignee && (
        <Text size="xs" c="dimmed" mt="xs">
          Asignado a: {assignee.name}
        </Text>
      )}

      <Group gap="xs" mt="sm">
        <Tooltip label="Mover a columna anterior" disabled={!canMoveLeft}>
          <ActionIcon
            variant="light"
            color="gray"
            size="sm"
            disabled={!canMoveLeft}
            onClick={() => handleMove('left')}
            aria-label="Mover a columna anterior"
          >
            <IconArrowLeft size={14} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Mover a columna siguiente" disabled={!canMoveRight}>
          <ActionIcon
            variant="light"
            color="indigo"
            size="sm"
            disabled={!canMoveRight}
            onClick={() => handleMove('right')}
            aria-label="Mover a columna siguiente"
          >
            <IconArrowRight size={14} stroke={1.5} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  );
}
