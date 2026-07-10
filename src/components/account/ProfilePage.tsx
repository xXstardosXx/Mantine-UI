import {
  Avatar,
  Badge,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCalendar, IconDeviceFloppy, IconMail, IconPhone, IconUser } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface ProfileFormValues {
  name: string;
  phone: string;
  bio: string;
  department: string;
}

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      phone: '',
      bio: '',
      department: '',
    },
    validate: {
      name: (value) => {
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < 3) return 'Mínimo 3 caracteres';
        return null;
      },
      phone: (value) => {
        if (!value.trim()) return 'El teléfono es obligatorio';
        return null;
      },
      department: (value) => (!value.trim() ? 'El departamento es obligatorio' : null),
      bio: (value) => {
        if (!value.trim()) return 'La biografía es obligatoria';
        if (value.trim().length < 20) return 'Escribe al menos 20 caracteres';
        return null;
      },
    },
  });

  useEffect(() => {
    if (user) {
      form.setValues({
        name: user.name,
        phone: user.phone,
        bio: user.bio,
        department: user.department,
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = form.onSubmit(async (values) => {
    setSaving(true);
    try {
      await updateProfile(values);
    } finally {
      setSaving(false);
    }
  });

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(date));

  return (
    <Container size="md" py="md">
      <Title order={2} mb="xs">
        Mi Perfil
      </Title>
      <Text c="dimmed" size="sm" mb="lg">
        Administra tu información personal y datos de contacto
      </Text>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="md" radius="lg" padding="lg" withBorder>
            <Stack align="center" gap="md">
              <Avatar size={100} radius="xl" color="indigo" aria-label={`Avatar de ${user.name}`}>
                {user.avatar}
              </Avatar>
              <div style={{ textAlign: 'center' }}>
                <Text fw={700} size="lg">
                  {user.name}
                </Text>
                <Text size="sm" c="dimmed">
                  {user.role}
                </Text>
              </div>
              <Badge color={user.status === 'active' ? 'teal' : 'gray'} variant="light" size="lg">
                {user.status === 'active' ? 'Activo' : 'Inactivo'}
              </Badge>

              <Stack gap="xs" w="100%" mt="sm">
                <Group gap="xs">
                  <IconMail size={16} stroke={1.5} aria-hidden="true" />
                  <Text size="sm">{user.email}</Text>
                </Group>
                <Group gap="xs">
                  <IconCalendar size={16} stroke={1.5} aria-hidden="true" />
                  <Text size="sm">Desde {formatDate(user.joinedAt)}</Text>
                </Group>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card shadow="md" radius="lg" padding="lg" withBorder>
            <Title order={4} mb="md">
              Editar información
            </Title>

            <form onSubmit={handleSubmit} noValidate>
              <Stack gap="md">
                <TextInput
                  label="Nombre completo"
                  withAsterisk
                  leftSection={<IconUser size={16} stroke={1.5} aria-hidden="true" />}
                  key={form.key('name')}
                  {...form.getInputProps('name')}
                />

                <TextInput
                  label="Correo electrónico"
                  value={user.email}
                  disabled
                  description="El correo no puede modificarse"
                  leftSection={<IconMail size={16} stroke={1.5} aria-hidden="true" />}
                />

                <TextInput
                  label="Teléfono"
                  withAsterisk
                  leftSection={<IconPhone size={16} stroke={1.5} aria-hidden="true" />}
                  key={form.key('phone')}
                  {...form.getInputProps('phone')}
                />

                <TextInput
                  label="Departamento"
                  withAsterisk
                  key={form.key('department')}
                  {...form.getInputProps('department')}
                />

                <Textarea
                  label="Biografía"
                  withAsterisk
                  minRows={4}
                  autosize
                  key={form.key('bio')}
                  {...form.getInputProps('bio')}
                />

                <Group justify="flex-end">
                  <Button
                    type="submit"
                    leftSection={<IconDeviceFloppy size={18} stroke={1.5} aria-hidden="true" />}
                    loading={saving}
                  >
                    Guardar cambios
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
