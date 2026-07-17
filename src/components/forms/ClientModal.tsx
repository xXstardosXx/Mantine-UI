import { useState } from 'react';
import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconCheck, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { Client, ClientPlan } from '../../types';

interface ClientFormValues {
  name: string;
  email: string;
  company: string;
  plan: ClientPlan | '';
  startDate: Date | null;
}

interface ClientModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (client: Omit<Client, 'id'>) => Promise<void>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ClientModal({ opened, onClose, onSubmit }: ClientModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ClientFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      name: '',
      email: '',
      company: '',
      plan: '',
      startDate: null,
    },
    validate: {
      name: (value) => {
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
        return null;
      },
      email: (value) => {
        if (!value.trim()) return 'El correo electrónico es obligatorio';
        if (!EMAIL_REGEX.test(value.trim())) return 'Ingresa un correo electrónico válido';
        return null;
      },
      company: (value) => {
        if (!value.trim()) return 'La empresa es obligatoria';
        return null;
      },
      plan: (value) => (!value ? 'Selecciona un plan' : null),
      startDate: (value) => {
        if (!value) return 'La fecha de inicio es obligatoria';
        if (dayjs(value).isAfter(dayjs(), 'day')) {
          return 'La fecha de inicio no puede ser futura';
        }
        return null;
      },
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);

    try {
      await onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        plan: values.plan as ClientPlan,
        startDate: dayjs(values.startDate).format('YYYY-MM-DD'),
      });

      notifications.show({
        title: 'Cliente agregado',
        message: `${values.name} fue registrado exitosamente.`,
        color: 'teal',
        icon: <IconCheck size={18} stroke={1.5} />,
      });

      form.reset();
      onClose();
    } catch {
      notifications.show({
        title: 'Error al agregar cliente',
        message: 'No se pudo registrar el cliente. Intenta de nuevo.',
        color: 'red',
        icon: <IconX size={18} stroke={1.5} />,
      });
    } finally {
      setSubmitting(false);
    }
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Agregar Cliente"
      size="md"
      centered
      aria-labelledby="client-modal-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <TextInput
            label="Nombre del contacto"
            placeholder="Ej: Juan Pérez"
            withAsterisk
            key={form.key('name')}
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Correo electrónico"
            placeholder="contacto@empresa.com"
            type="email"
            withAsterisk
            key={form.key('email')}
            {...form.getInputProps('email')}
          />

          <TextInput
            label="Empresa"
            placeholder="Nombre de la organización"
            withAsterisk
            key={form.key('company')}
            {...form.getInputProps('company')}
          />

          <Select
            label="Plan de suscripción"
            placeholder="Seleccionar plan"
            withAsterisk
            data={[
              { value: 'starter', label: 'Starter — $29/mes' },
              { value: 'professional', label: 'Professional — $79/mes' },
              { value: 'enterprise', label: 'Enterprise — $199/mes' },
            ]}
            key={form.key('plan')}
            {...form.getInputProps('plan')}
          />

          <DatePickerInput
            label="Fecha de inicio"
            placeholder="Seleccionar fecha"
            withAsterisk
            leftSection={<IconCalendar size={16} stroke={1.5} aria-hidden="true" />}
            maxDate={new Date()}
            valueFormat="DD MMM YYYY"
            key={form.key('startDate')}
            {...form.getInputProps('startDate')}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              Guardar Cliente
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
