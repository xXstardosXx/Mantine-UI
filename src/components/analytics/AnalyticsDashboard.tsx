import { Button, Card, Container, Grid, Group, Text, Title } from '@mantine/core';
import { IconUserPlus } from '@tabler/icons-react';
import type { AnalyticsMetric, Project } from '../../types';
import { AnalyticsTable } from './AnalyticsTable';
import { StatsCards } from './StatsCards';

interface AnalyticsDashboardProps {
  metrics: AnalyticsMetric[];
  projects: Project[];
  loading: boolean;
  onAddClient: () => void;
}

export function AnalyticsDashboard({
  metrics,
  projects,
  loading,
  onAddClient,
}: AnalyticsDashboardProps) {
  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg" align="flex-end">
        <div>
          <Title order={2}>Dashboard de Analítica</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Métricas clave y gestión de proyectos en tiempo real
          </Text>
        </div>
        <Button
          leftSection={<IconUserPlus size={18} stroke={1.5} aria-hidden="true" />}
          onClick={onAddClient}
          aria-label="Agregar nuevo cliente"
        >
          Agregar Cliente
        </Button>
      </Group>

      <StatsCards metrics={metrics} />

      <Grid gap="md" mt="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card shadow="md" radius="lg" padding="lg" withBorder>
            <Title order={4} mb="md">
              Proyectos Recientes
            </Title>
            <AnalyticsTable projects={projects} loading={loading} />
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card shadow="md" radius="lg" padding="lg" withBorder h="100%">
            <Title order={4} mb="md">
              Resumen del Período
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              Comparativa del mes actual respecto al anterior.
            </Text>
            <Grid gap="sm">
              <Grid.Col span={6}>
                <Card padding="sm" radius="md" bg="indigo.0" withBorder={false}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Nuevos clientes
                  </Text>
                  <Text size="lg" fw={700} c="indigo">
                    +12
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card padding="sm" radius="md" bg="teal.0" withBorder={false}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Tasa retención
                  </Text>
                  <Text size="lg" fw={700} c="teal">
                    94.2%
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card padding="sm" radius="md" bg="orange.0" withBorder={false}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Tickets abiertos
                  </Text>
                  <Text size="lg" fw={700} c="orange">
                    23
                  </Text>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card padding="sm" radius="md" bg="grape.0" withBorder={false}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    NPS Score
                  </Text>
                  <Text size="lg" fw={700} c="grape">
                    72
                  </Text>
                </Card>
              </Grid.Col>
            </Grid>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
