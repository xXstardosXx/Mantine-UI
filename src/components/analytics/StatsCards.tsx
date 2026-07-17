import { Card, Group, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconBriefcase,
  IconCash,
  IconCheckbox,
  IconUsers,
} from '@tabler/icons-react';
import type { AnalyticsMetric } from '../../types';
import classes from './StatsCards.module.css';

const ICON_MAP = {
  revenue: IconCash,
  users: IconUsers,
  tasks: IconCheckbox,
  projects: IconBriefcase,
} as const;

interface StatsCardsProps {
  metrics: AnalyticsMetric[];
}

export function StatsCards({ metrics }: StatsCardsProps) {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
      {metrics.map((metric) => {
        const Icon = ICON_MAP[metric.icon];
        const isPositive = metric.change >= 0;

        return (
          <Card key={metric.id} shadow="md" radius="lg" padding="lg" withBorder className={classes.card}>
            <Group justify="space-between" align="flex-start" mb="sm">
              <ThemeIcon size="lg" radius="md" variant="light" color="indigo" aria-hidden="true">
                <Icon size={20} stroke={1.5} />
              </ThemeIcon>
              <Group gap={4} aria-label={`Variación: ${metric.change}%`}>
                {isPositive ? (
                  <IconArrowUpRight size={16} color="var(--mantine-color-teal-6)" aria-hidden="true" />
                ) : (
                  <IconArrowDownRight size={16} color="var(--mantine-color-red-6)" aria-hidden="true" />
                )}
                <Text size="xs" fw={600} c={isPositive ? 'teal' : 'red'}>
                  {isPositive ? '+' : ''}
                  {metric.change}%
                </Text>
              </Group>
            </Group>
            <Text size="sm" c="dimmed" fw={500}>
              {metric.label}
            </Text>
            <Text size="xl" fw={700} mt={4}>
              {metric.value}
            </Text>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
