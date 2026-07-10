import { Badge, Box, Group, ScrollArea, Stack, Text, Title } from '@mantine/core';
import type { Task, TaskStatus, User } from '../../types';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  color: string;
  tasks: Task[];
  users: User[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
}

export function KanbanColumn({
  title,
  status,
  color,
  tasks,
  users,
  onMoveTask,
}: KanbanColumnProps) {
  const columnTasks = tasks.filter((task) => task.status === status);
  const userMap = new Map(users.map((user) => [user.id, user]));

  return (
    <Box
      style={{
        flex: 1,
        minWidth: 280,
        maxWidth: 360,
      }}
      role="region"
      aria-label={`Columna ${title}`}
    >
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          <Title order={5}>{title}</Title>
          <Badge color={color} variant="light" size="sm" aria-label={`${columnTasks.length} tareas`}>
            {columnTasks.length}
          </Badge>
        </Group>
      </Group>

      <ScrollArea.Autosize mah="calc(100vh - 280px)" type="auto" offsetScrollbars>
        <Stack gap="sm" pb="md">
          {columnTasks.length === 0 ? (
            <Box
              p="lg"
              style={{
                border: '2px dashed var(--mantine-color-gray-3)',
                borderRadius: 'var(--mantine-radius-md)',
              }}
            >
              <Text size="sm" c="dimmed" ta="center">
                Sin tareas en esta columna
              </Text>
            </Box>
          ) : (
            columnTasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                assignee={userMap.get(task.assigneeId)}
                onMove={onMoveTask}
              />
            ))
          )}
        </Stack>
      </ScrollArea.Autosize>
    </Box>
  );
}
