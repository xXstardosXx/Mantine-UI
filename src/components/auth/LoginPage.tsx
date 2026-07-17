import {
  Box,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  PasswordInput,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconChartBar, IconCheck, IconLock, IconMail, IconUser } from '@tabler/icons-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { LoginCredentials, RegisterCredentials } from '../../types';
import classes from './LoginPage.module.css';

export function LoginPage() {
  const { login, register } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>('login');

  const loginForm = useForm<LoginCredentials>({
    mode: 'uncontrolled',
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) => {
        if (!value.trim()) return 'El correo es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Ingresa un correo electrónico válido';
        }
        return null;
      },
      password: (value) => {
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return null;
      },
    },
  });

  const registerForm = useForm<RegisterCredentials & { confirmPassword: string }>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      department: '',
    },
    validate: {
      name: (value) => {
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < 3) return 'Mínimo 3 caracteres';
        return null;
      },
      email: (value) => {
        if (!value.trim()) return 'El correo es obligatorio';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return 'Ingresa un correo electrónico válido';
        }
        return null;
      },
      password: (value) => {
        if (!value) return 'La contraseña es obligatoria';
        if (value.length < 6) return 'Mínimo 6 caracteres';
        return null;
      },
      confirmPassword: (value, values) =>
        value !== values.password ? 'Las contraseñas no coinciden' : null,
    },
  });

  const handleLogin = loginForm.onSubmit(async (values) => {
    setSubmitting(true);
    const success = await login(values);

    if (!success) {
      notifications.show({
        title: 'Error de autenticación',
        message: 'Correo o contraseña incorrectos. Verifica tus credenciales.',
        color: 'red',
        icon: <IconAlertCircle size={18} stroke={1.5} />,
      });
    } else {
      notifications.show({
        title: 'Bienvenido a SaaSFlow',
        message: 'Inicio de sesión exitoso. Redirigiendo al panel...',
        color: 'teal',
        icon: <IconCheck size={18} stroke={1.5} />,
      });
    }

    setSubmitting(false);
  });

  const handleRegister = registerForm.onSubmit(async (values) => {
    setSubmitting(true);

    const result = await register({
      name: values.name,
      email: values.email,
      password: values.password,
      department: values.department,
    });

    if (!result.success) {
      notifications.show({
        title: 'No se pudo registrar',
        message: result.error ?? 'Ocurrió un error al crear la cuenta.',
        color: 'red',
        icon: <IconAlertCircle size={18} stroke={1.5} />,
      });
    } else {
      notifications.show({
        title: 'Cuenta creada',
        message: 'Tu perfil fue registrado exitosamente. ¡Bienvenido!',
        color: 'teal',
        icon: <IconCheck size={18} stroke={1.5} />,
      });
    }

    setSubmitting(false);
  });

  return (
    <Box
      component="main"
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, var(--mantine-color-indigo-0) 0%, var(--mantine-color-slate-0) 50%, var(--mantine-color-indigo-1) 100%)',
      }}
    >
      <Container size="lg" py="xl" h="100%">
        <Center mih="100vh">
          <Group align="stretch" gap={0} wrap="nowrap" style={{ width: '100%', maxWidth: rem(900) }}>
            <Card
              visibleFrom="md"
              radius="lg"
              padding="xl"
              className={classes.heroCard}
              style={{
                flex: 1,
                background: 'linear-gradient(145deg, var(--mantine-color-indigo-6), var(--mantine-color-indigo-8))',
                color: 'white',
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
            >
              <Stack justify="center" h="100%" gap="xl">
                <div>
                  <Group gap="sm" mb="lg">
                    <IconChartBar size={32} stroke={1.5} aria-hidden="true" />
                    <Title order={2} c="white">
                      SaaSFlow
                    </Title>
                  </Group>
                  <Title order={1} c="white" mb="md">
                    Gestiona tus proyectos con inteligencia
                  </Title>
                  <Text c="indigo.1" size="lg">
                    Dashboard de analítica y tablero Kanban en una sola plataforma.
                    Accede a métricas, tareas y equipos en tiempo real.
                  </Text>
                </div>
              </Stack>
            </Card>

            <Card
              shadow="lg"
              radius="lg"
              padding="xl"
              withBorder
              style={{
                flex: 1,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
            >
              <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
                <Tabs.List grow mb="lg">
                  <Tabs.Tab value="login">Iniciar Sesión</Tabs.Tab>
                  <Tabs.Tab value="register">Crear Cuenta</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="login">
                  <Stack gap="md">
                    <div>
                      <Title order={3}>Iniciar Sesión</Title>
                      <Text c="dimmed" size="sm" mt={4}>
                        Ingresa tus credenciales para acceder al panel
                      </Text>
                    </div>

                    <form onSubmit={handleLogin} noValidate>
                      <Stack gap="md">
                        <TextInput
                          label="Correo electrónico"
                          placeholder="tu@empresa.com"
                          withAsterisk
                          leftSection={<IconMail size={16} stroke={1.5} aria-hidden="true" />}
                          key={loginForm.key('email')}
                          {...loginForm.getInputProps('email')}
                        />

                        <PasswordInput
                          label="Contraseña"
                          placeholder="Tu contraseña"
                          withAsterisk
                          leftSection={<IconLock size={16} stroke={1.5} aria-hidden="true" />}
                          key={loginForm.key('password')}
                          {...loginForm.getInputProps('password')}
                        />

                        <Button type="submit" fullWidth size="md" loading={submitting} mt="sm">
                          Ingresar
                        </Button>
                      </Stack>
                    </form>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="register">
                  <Stack gap="md">
                    <div>
                      <Title order={3}>Crear Cuenta</Title>
                      <Text c="dimmed" size="sm" mt={4}>
                        Registra un nuevo perfil para acceder a la plataforma
                      </Text>
                    </div>

                    <form onSubmit={handleRegister} noValidate>
                      <Stack gap="md">
                        <TextInput
                          label="Nombre completo"
                          placeholder="Ej: Juan Pérez"
                          withAsterisk
                          leftSection={<IconUser size={16} stroke={1.5} aria-hidden="true" />}
                          key={registerForm.key('name')}
                          {...registerForm.getInputProps('name')}
                        />

                        <TextInput
                          label="Correo electrónico"
                          placeholder="tu@empresa.com"
                          withAsterisk
                          leftSection={<IconMail size={16} stroke={1.5} aria-hidden="true" />}
                          key={registerForm.key('email')}
                          {...registerForm.getInputProps('email')}
                        />

                        <TextInput
                          label="Departamento"
                          placeholder="Ej: Ingeniería, Producto..."
                          key={registerForm.key('department')}
                          {...registerForm.getInputProps('department')}
                        />

                        <PasswordInput
                          label="Contraseña"
                          placeholder="Mínimo 6 caracteres"
                          withAsterisk
                          leftSection={<IconLock size={16} stroke={1.5} aria-hidden="true" />}
                          key={registerForm.key('password')}
                          {...registerForm.getInputProps('password')}
                        />

                        <PasswordInput
                          label="Confirmar contraseña"
                          placeholder="Repite tu contraseña"
                          withAsterisk
                          leftSection={<IconLock size={16} stroke={1.5} aria-hidden="true" />}
                          key={registerForm.key('confirmPassword')}
                          {...registerForm.getInputProps('confirmPassword')}
                        />

                        <Button type="submit" fullWidth size="md" loading={submitting} mt="sm">
                          Crear cuenta
                        </Button>
                      </Stack>
                    </form>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Card>
          </Group>
        </Center>
      </Container>

      {submitting && (
        <Center
          pos="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(255,255,255,0.5)"
          style={{ zIndex: 1000 }}
          role="status"
          aria-label="Procesando solicitud"
        >
          <Loader color="indigo" size="lg" />
        </Center>
      )}
    </Box>
  );
}
