import { Box, Button, Container, Group, LoadingOverlay, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { KANBAN_COLUMNS } from '../../data/mockData';
import type { Task, TaskStatus, User } from '../../types';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  tasks: Task[];
  users: User[];
  loading: boolean;
  onCreateTask: () => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  users,
  loading,
  onCreateTask,
  onMoveTask,
}: KanbanBoardProps) {
  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg" align="flex-end">
        <div>
          <Title order={2}>Tablero Kanban</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Gestiona el flujo de trabajo de tu equipo de forma visual
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={18} stroke={1.5} aria-hidden="true" />}
          onClick={onCreateTask}
          aria-label="Crear nueva tarea"
        >
          Nueva Tarea
        </Button>
      </Group>

      <Box pos="relative" style={{ minHeight: 400 }}>
        <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'md', blur: 2 }} />

        <Group align="flex-start" gap="md" wrap="nowrap" style={{ overflowX: 'auto', paddingBottom: 8 }}>
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              title={column.title}
              status={column.id}
              color={column.color}
              tasks={tasks}
              users={users}
              onMoveTask={onMoveTask}
            />
          ))}
        </Group>
      </Box>
    </Container>
  );
}
