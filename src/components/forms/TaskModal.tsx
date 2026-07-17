import { useState } from 'react';
import { Button, Group, Modal, MultiSelect, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCalendar, IconCheck, IconX } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { TAG_OPTIONS } from '../../data/mockData';
import type { Project, Task, TaskPriority, TaskStatus, User } from '../../types';

interface TaskFormValues {
  title: string;
  description: string;
  assigneeId: string;
  projectId: string;
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  dueDate: Date | null;
}

interface TaskModalProps {
  opened: boolean;
  onClose: () => void;
  users: User[];
  projects: Project[];
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
}

export function TaskModal({ opened, onClose, users, projects, onSubmit }: TaskModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TaskFormValues>({
    mode: 'uncontrolled',
    initialValues: {
      title: '',
      description: '',
      assigneeId: '',
      projectId: '',
      priority: 'medium',
      status: 'todo',
      tags: [],
      dueDate: null,
    },
    validate: {
      title: (value) => {
        if (!value.trim()) return 'El título es obligatorio';
        if (value.trim().length < 3) return 'El título debe tener al menos 3 caracteres';
        return null;
      },
      description: (value) => {
        if (!value.trim()) return 'La descripción es obligatoria';
        if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres';
        return null;
      },
      assigneeId: (value) => (!value ? 'Selecciona un responsable' : null),
      projectId: (value) => (!value ? 'Selecciona un proyecto' : null),
      dueDate: (value) => {
        if (!value) return 'La fecha límite es obligatoria';
        if (dayjs(value).isBefore(dayjs(), 'day')) {
          return 'La fecha límite no puede ser anterior a hoy';
        }
        return null;
      },
    },
  });

  const handleSubmit = form.onSubmit(async (values) => {
    setSubmitting(true);

    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        assigneeId: values.assigneeId,
        projectId: values.projectId,
        priority: values.priority,
        status: values.status,
        tags: values.tags,
        dueDate: dayjs(values.dueDate).format('YYYY-MM-DD'),
      });

      notifications.show({
        title: 'Tarea creada',
        message: `"${values.title}" se agregó al tablero correctamente.`,
        color: 'teal',
        icon: <IconCheck size={18} stroke={1.5} />,
      });

      form.reset();
      onClose();
    } catch {
      notifications.show({
        title: 'Error al crear tarea',
        message: 'Ocurrió un problema al guardar la tarea. Intenta de nuevo.',
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
      title="Crear Nueva Tarea"
      size="lg"
      centered
      aria-labelledby="task-modal-title"
    >
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="md">
          <TextInput
            label="Título"
            placeholder="Ej: Implementar módulo de reportes"
            withAsterisk
            key={form.key('title')}
            {...form.getInputProps('title')}
          />

          <Textarea
            label="Descripción"
            placeholder="Describe los detalles y criterios de aceptación..."
            withAsterisk
            minRows={3}
            autosize
            key={form.key('description')}
            {...form.getInputProps('description')}
          />

          <Group grow align="flex-start">
            <Select
              label="Responsable"
              placeholder="Seleccionar usuario"
              withAsterisk
              data={users.map((user) => ({ value: user.id, label: user.name }))}
              key={form.key('assigneeId')}
              {...form.getInputProps('assigneeId')}
            />
            <Select
              label="Proyecto"
              placeholder="Seleccionar proyecto"
              withAsterisk
              data={projects.map((project) => ({ value: project.id, label: project.name }))}
              key={form.key('projectId')}
              {...form.getInputProps('projectId')}
            />
          </Group>

          <Group grow align="flex-start">
            <Select
              label="Prioridad"
              data={[
                { value: 'low', label: 'Baja' },
                { value: 'medium', label: 'Media' },
                { value: 'high', label: 'Alta' },
                { value: 'critical', label: 'Crítica' },
              ]}
              key={form.key('priority')}
              {...form.getInputProps('priority')}
            />
            <Select
              label="Estado inicial"
              data={[
                { value: 'todo', label: 'Por Hacer' },
                { value: 'in-progress', label: 'En Progreso' },
                { value: 'done', label: 'Completado' },
              ]}
              key={form.key('status')}
              {...form.getInputProps('status')}
            />
          </Group>

          <MultiSelect
            label="Etiquetas"
            placeholder="Seleccionar etiquetas"
            data={TAG_OPTIONS}
            searchable
            clearable
            key={form.key('tags')}
            {...form.getInputProps('tags')}
          />

          <DatePickerInput
            label="Fecha límite"
            placeholder="Seleccionar fecha"
            withAsterisk
            leftSection={<IconCalendar size={16} stroke={1.5} aria-hidden="true" />}
            minDate={new Date()}
            valueFormat="DD MMM YYYY"
            key={form.key('dueDate')}
            {...form.getInputProps('dueDate')}
          />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              Crear Tarea
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
