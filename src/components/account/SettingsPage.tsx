import {
  Button,
  Card,
  Container,
  Divider,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  Title,
} from '@mantine/core';
import { IconBell, IconLanguage, IconMoon, IconSun } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { AppLanguage, ColorScheme } from '../../types';

export function SettingsPage() {
  const { settings, updateSettings } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    localSettings.emailNotifications !== settings.emailNotifications ||
    localSettings.pushNotifications !== settings.pushNotifications ||
    localSettings.language !== settings.language ||
    localSettings.colorScheme !== settings.colorScheme;

  return (
    <Container size="md" py="md">
      <Title order={2} mb="xs">
        Configuración
      </Title>
      <Text c="dimmed" size="sm" mb="lg">
        Personaliza tu experiencia en la plataforma
      </Text>

      <Stack gap="md">
        <Card shadow="md" radius="lg" padding="lg" withBorder>
          <Group gap="sm" mb="md">
            <IconBell size={20} stroke={1.5} aria-hidden="true" />
            <Title order={4}>Notificaciones</Title>
          </Group>

          <Stack gap="md">
            <Switch
              label="Notificaciones por correo"
              description="Recibe alertas de tareas y proyectos en tu email"
              checked={localSettings.emailNotifications}
              onChange={(event) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  emailNotifications: event.currentTarget.checked,
                }))
              }
            />
            <Switch
              label="Notificaciones push"
              description="Alertas en tiempo real en el navegador"
              checked={localSettings.pushNotifications}
              onChange={(event) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  pushNotifications: event.currentTarget.checked,
                }))
              }
            />
          </Stack>
        </Card>

        <Card shadow="md" radius="lg" padding="lg" withBorder>
          <Group gap="sm" mb="md">
            <IconLanguage size={20} stroke={1.5} aria-hidden="true" />
            <Title order={4}>Idioma y apariencia</Title>
          </Group>

          <Stack gap="lg">
            <Select
              label="Idioma de la interfaz"
              data={[
                { value: 'es', label: 'Español' },
                { value: 'en', label: 'English' },
              ]}
              value={localSettings.language}
              onChange={(value) =>
                setLocalSettings((prev) => ({
                  ...prev,
                  language: (value as AppLanguage) ?? 'es',
                }))
              }
            />

            <div>
              <Text size="sm" fw={500} mb="xs">
                Tema de color
              </Text>
              <SegmentedControl
                fullWidth
                value={localSettings.colorScheme}
                onChange={(value) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    colorScheme: value as ColorScheme,
                  }))
                }
                data={[
                  {
                    value: 'light',
                    label: (
                      <Group gap={6} justify="center" wrap="nowrap">
                        <IconSun size={14} stroke={1.5} />
                        Claro
                      </Group>
                    ),
                  },
                  {
                    value: 'dark',
                    label: (
                      <Group gap={6} justify="center" wrap="nowrap">
                        <IconMoon size={14} stroke={1.5} />
                        Oscuro
                      </Group>
                    ),
                  },
                ]}
              />
              <Text size="xs" c="dimmed" mt="xs">
                El tema se aplica al guardar la configuración
              </Text>
            </div>
          </Stack>
        </Card>

        <Divider />

        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={() => setLocalSettings(settings)}
            disabled={!hasChanges || saving}
          >
            Descartar cambios
          </Button>
          <Button onClick={handleSave} loading={saving} disabled={!hasChanges}>
            Guardar configuración
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
