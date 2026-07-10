import { useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Group,
  LoadingOverlay,
  Pagination,
  Progress,
  Table,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp, IconSearch, IconSelector } from '@tabler/icons-react';
import type { Project, TableSort } from '../../types';
import { EmptyState } from './EmptyState';

const PAGE_SIZE = 4;

const STATUS_COLORS: Record<Project['status'], string> = {
  active: 'blue',
  paused: 'yellow',
  completed: 'green',
};

const STATUS_LABELS: Record<Project['status'], string> = {
  active: 'Activo',
  paused: 'Pausado',
  completed: 'Completado',
};

interface ThProps {
  children: React.ReactNode;
  sorted: boolean;
  reversed: boolean;
  onSort: () => void;
  ariaLabel: string;
}

function Th({ children, sorted, reversed, onSort, ariaLabel }: ThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;

  return (
    <Table.Th scope="col">
      <UnstyledButton onClick={onSort} aria-label={ariaLabel} style={{ width: '100%' }}>
        <Group justify="space-between" gap="xs" wrap="nowrap">
          <Text fw={600} size="sm">
            {children}
          </Text>
          <Icon size={14} stroke={1.5} aria-hidden="true" />
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

interface AnalyticsTableProps {
  projects: Project[];
  loading: boolean;
}

export function AnalyticsTable({ projects, loading }: AnalyticsTableProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<TableSort>({ column: 'name', direction: 'asc' });

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.client.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query),
    );
  }, [projects, search]);

  const sortedProjects = useMemo(() => {
    const sorted = [...filteredProjects].sort((a, b) => {
      const aVal = a[sort.column];
      const bVal = b[sort.column];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      const comparison = aStr.localeCompare(bStr, 'es');
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredProjects, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / PAGE_SIZE));

  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedProjects.slice(start, start + PAGE_SIZE);
  }, [sortedProjects, page]);

  const handleSort = (column: keyof Project) => {
    setSort((current) => ({
      column,
      direction:
        current.column === column && current.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(date));

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'md', blur: 2 }} />

      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Buscar proyectos..."
          leftSection={<IconSearch size={16} stroke={1.5} aria-hidden="true" />}
          value={search}
          onChange={(event) => handleSearchChange(event.currentTarget.value)}
          aria-label="Buscar proyectos por nombre, cliente o estado"
          maw={360}
          style={{ flex: 1 }}
        />
        <Text size="sm" c="dimmed" aria-live="polite">
          {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''}
        </Text>
      </Group>

      {paginatedProjects.length === 0 ? (
        <EmptyState
          title="No hay proyectos"
          description={
            search
              ? `No se encontraron proyectos para "${search}". Prueba con otro término.`
              : 'Aún no hay proyectos registrados en el sistema.'
          }
        />
      ) : (
        <>
          <Table.ScrollContainer minWidth={700}>
            <Table
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              aria-label="Tabla de proyectos"
            >
              <Table.Thead>
                <Table.Tr>
                  <Th
                    sorted={sort.column === 'name'}
                    reversed={sort.direction === 'desc'}
                    onSort={() => handleSort('name')}
                    ariaLabel="Ordenar por nombre del proyecto"
                  >
                    Proyecto
                  </Th>
                  <Th
                    sorted={sort.column === 'client'}
                    reversed={sort.direction === 'desc'}
                    onSort={() => handleSort('client')}
                    ariaLabel="Ordenar por cliente"
                  >
                    Cliente
                  </Th>
                  <Th
                    sorted={sort.column === 'status'}
                    reversed={sort.direction === 'desc'}
                    onSort={() => handleSort('status')}
                    ariaLabel="Ordenar por estado"
                  >
                    Estado
                  </Th>
                  <Th
                    sorted={sort.column === 'progress'}
                    reversed={sort.direction === 'desc'}
                    onSort={() => handleSort('progress')}
                    ariaLabel="Ordenar por progreso"
                  >
                    Progreso
                  </Th>
                  <Th
                    sorted={sort.column === 'budget'}
                    reversed={sort.direction === 'desc'}
                    onSort={() => handleSort('budget')}
                    ariaLabel="Ordenar por presupuesto"
                  >
                    Presupuesto
                  </Th>
                  <Th
                    sorted={sort.column === 'deadline'}
                    reversed={sort.direction === 'desc'}
                    onSort={() => handleSort('deadline')}
                    ariaLabel="Ordenar por fecha límite"
                  >
                    Fecha límite
                  </Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedProjects.map((project) => (
                  <Table.Tr key={project.id}>
                    <Table.Td>
                      <Text fw={500} size="sm">
                        {project.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {project.teamSize} miembros
                      </Text>
                    </Table.Td>
                    <Table.Td>{project.client}</Table.Td>
                    <Table.Td>
                      <Badge color={STATUS_COLORS[project.status]} variant="light">
                        {STATUS_LABELS[project.status]}
                      </Badge>
                    </Table.Td>
                    <Table.Td maw={140}>
                      <Group gap="xs" wrap="nowrap">
                        <Progress
                          value={project.progress}
                          size="sm"
                          radius="xl"
                          style={{ flex: 1 }}
                          aria-label={`Progreso: ${project.progress}%`}
                        />
                        <Text size="xs" fw={500}>
                          {project.progress}%
                        </Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{formatCurrency(project.budget)}</Table.Td>
                    <Table.Td>{formatDate(project.deadline)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>

          {totalPages > 1 && (
            <Group justify="center" mt="lg">
              <Pagination
                total={totalPages}
                value={page}
                onChange={setPage}
                aria-label="Paginación de proyectos"
              />
            </Group>
          )}
        </>
      )}
    </Box>
  );
}
