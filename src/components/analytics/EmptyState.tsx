import { Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconSearchOff } from '@tabler/icons-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'Sin resultados',
  description = 'No se encontraron registros que coincidan con tu búsqueda. Intenta ajustar los filtros.',
}: EmptyStateProps) {
  return (
    <Stack align="center" gap="md" py="xl" role="status" aria-live="polite">
      <ThemeIcon size={64} radius="xl" variant="light" color="gray" aria-hidden="true">
        <IconSearchOff size={32} stroke={1.5} />
      </ThemeIcon>
      <Title order={4}>{title}</Title>
      <Text c="dimmed" size="sm" ta="center" maw={400}>
        {description}
      </Text>
    </Stack>
  );
}
