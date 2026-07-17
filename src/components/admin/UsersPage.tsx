import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Card,
  Container,
  Group,
  LoadingOverlay,
  Switch,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconShieldCheck } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { adminApi } from '../../services/adminApi';
import { ApiError } from '../../services/apiClient';
import type { AuthUser } from '../../types';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    adminApi
      .listUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la lista de usuarios.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = async (targetUser: AuthUser, field: 'status' | 'isAdmin', value: boolean) => {
    try {
      const payload =
        field === 'status'
          ? { status: (value ? 'active' : 'inactive') as 'active' | 'inactive' }
          : { isAdmin: value };
      const updated = await adminApi.updateUser(targetUser.id, payload);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      notifications.show({
        title: 'Usuario actualizado',
        message: `Los permisos de ${updated.name} se actualizaron correctamente.`,
        color: 'teal',
        icon: <IconCheck size={18} stroke={1.5} />,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'No se pudo actualizar el usuario.';
      notifications.show({
        title: 'Error al actualizar',
        message,
        color: 'red',
        icon: <IconAlertCircle size={18} stroke={1.5} />,
      });
    }
  };

  const formatDate = (date: string) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(date));

  return (
    <Container size="lg" py="md">
      <Group gap="sm" mb="xs">
        <IconShieldCheck size={28} stroke={1.5} color="var(--mantine-color-indigo-6)" aria-hidden="true" />
        <Title order={2}>Gestión de Usuarios</Title>
      </Group>
      <Text c="dimmed" size="sm" mb="lg">
        Administra las cuentas registradas en la plataforma: activa, desactiva o asigna permisos de superusuario.
      </Text>

      {error && (
        <Alert color="red" icon={<IconAlertCircle size={18} stroke={1.5} />} mb="md">
          {error}
        </Alert>
      )}

      <Card shadow="md" radius="lg" padding="lg" withBorder>
        <Box pos="relative" style={{ minHeight: 200 }}>
          <LoadingOverlay visible={loading} zIndex={1000} overlayProps={{ radius: 'md', blur: 2 }} />

          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm" highlightOnHover aria-label="Tabla de usuarios registrados">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Usuario</Table.Th>
                  <Table.Th>Departamento</Table.Th>
                  <Table.Th>Registrado</Table.Th>
                  <Table.Th>Activo</Table.Th>
                  <Table.Th>Superusuario</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((row) => {
                  const isSelf = row.id === currentUser?.id;
                  return (
                    <Table.Tr key={row.id}>
                      <Table.Td>
                        <Group gap="sm" wrap="nowrap">
                          <Avatar color="indigo" radius="xl" size="sm" aria-hidden="true">
                            {row.avatar}
                          </Avatar>
                          <div>
                            <Text size="sm" fw={600}>
                              {row.name}
                              {isSelf && (
                                <Text component="span" size="xs" c="dimmed">
                                  {' '}
                                  (tú)
                                </Text>
                              )}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {row.email}
                            </Text>
                          </div>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="gray">
                          {row.department}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(row.joinedAt)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Switch
                          checked={row.status === 'active'}
                          disabled={isSelf}
                          onChange={(event) => handleToggle(row, 'status', event.currentTarget.checked)}
                          aria-label={`Activar o desactivar a ${row.name}`}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Switch
                          checked={row.isAdmin}
                          disabled={isSelf}
                          color="grape"
                          onChange={(event) => handleToggle(row, 'isAdmin', event.currentTarget.checked)}
                          aria-label={`Otorgar o quitar permisos de superusuario a ${row.name}`}
                        />
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Box>
      </Card>
    </Container>
  );
}
