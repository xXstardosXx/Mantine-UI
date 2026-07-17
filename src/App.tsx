import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useCallback, useEffect, useState } from 'react';
import { UsersPage } from './components/admin/UsersPage';
import { ProfilePage } from './components/account/ProfilePage';
import { SettingsPage } from './components/account/SettingsPage';
import { LoginPage } from './components/auth/LoginPage';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { ClientModal } from './components/forms/ClientModal';
import { TaskModal } from './components/forms/TaskModal';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { AppLayout, AuthLoadingScreen } from './components/layout/AppLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { analyticsApi } from './services/analyticsApi';
import { ApiError } from './services/apiClient';
import { clientsApi } from './services/clientsApi';
import { projectsApi } from './services/projectsApi';
import { tasksApi } from './services/tasksApi';
import { teamApi } from './services/teamApi';
import type { AnalyticsMetric, AnalyticsSummary, Client, Project, Task, TaskStatus, User, ViewId } from './types';
import { AppProviders } from './AppProviders';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Por Hacer',
  'in-progress': 'En Progreso',
  done: 'Completado',
};

function DashboardApp() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeView, setActiveView] = useState<ViewId>('analytics');

  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [taskModalOpened, { open: openTaskModal, close: closeTaskModal }] = useDisclosure(false);
  const [clientModalOpened, { open: openClientModal, close: closeClientModal }] = useDisclosure(false);

  const refreshAnalytics = useCallback(async () => {
    const analyticsRes = await analyticsApi.metrics();
    setMetrics(analyticsRes.metrics);
    setSummary(analyticsRes.summary);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    const loadAll = async () => {
      setDataLoading(true);
      try {
        const [teamRes, projectsRes, tasksRes, analyticsRes] = await Promise.all([
          teamApi.list(),
          projectsApi.list(),
          tasksApi.list(),
          analyticsApi.metrics(),
        ]);

        if (cancelled) return;
        setTeamMembers(teamRes);
        setProjects(projectsRes);
        setTasks(tasksRes);
        setMetrics(analyticsRes.metrics);
        setSummary(analyticsRes.summary);
      } catch {
        if (!cancelled) {
          notifications.show({
            title: 'Error al cargar datos',
            message: 'No se pudieron obtener los datos del servidor. Intenta recargar la página.',
            color: 'red',
            icon: <IconAlertCircle size={18} stroke={1.5} />,
          });
        }
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const handleOpenProfile = useCallback(() => setActiveView('profile'), []);
  const handleOpenSettings = useCallback(() => setActiveView('settings'), []);

  const handleLogout = useCallback(() => {
    setActiveView('analytics');
    logout();
  }, [logout]);

  const handleCreateTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask = await tasksApi.create(taskData);
    setTasks((prev) => [newTask, ...prev]);
    refreshAnalytics();
  }, [refreshAnalytics]);

  const handleMoveTask = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return;

      try {
        const updated = await tasksApi.updateStatus(taskId, newStatus);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));

        notifications.show({
          title: 'Estado actualizado',
          message: `"${task.title}" movida a ${STATUS_LABELS[newStatus]}.`,
          color: 'indigo',
          icon: <IconArrowRight size={18} stroke={1.5} />,
        });

        refreshAnalytics();
      } catch (error) {
        const message = error instanceof ApiError ? error.message : 'No se pudo mover la tarea.';
        notifications.show({
          title: 'Error al mover tarea',
          message,
          color: 'red',
          icon: <IconAlertCircle size={18} stroke={1.5} />,
        });
      }
    },
    [tasks, refreshAnalytics],
  );

  const handleCreateClient = useCallback(
    async (clientData: Omit<Client, 'id'>) => {
      const { project } = await clientsApi.create(clientData);
      setProjects((prev) => [project, ...prev]);

      notifications.show({
        title: 'Proyecto creado',
        message: `Se generó automáticamente el proyecto para ${clientData.company}.`,
        color: 'teal',
        icon: <IconCheck size={18} stroke={1.5} />,
      });

      refreshAnalytics();
    },
    [refreshAnalytics],
  );

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'analytics':
        return (
          <AnalyticsDashboard
            metrics={metrics}
            projects={projects}
            summary={summary}
            loading={dataLoading}
            onAddClient={openClientModal}
          />
        );
      case 'kanban':
        return (
          <KanbanBoard
            tasks={tasks}
            users={teamMembers}
            loading={dataLoading}
            onCreateTask={openTaskModal}
            onMoveTask={handleMoveTask}
          />
        );
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      case 'users':
        return user.isAdmin ? <UsersPage /> : null;
      default:
        return null;
    }
  };

  return (
    <AppLayout
      activeView={activeView}
      user={user}
      onNavigate={setActiveView}
      onOpenProfile={handleOpenProfile}
      onOpenSettings={handleOpenSettings}
      onLogout={handleLogout}
    >
      {renderContent()}

      <TaskModal
        opened={taskModalOpened}
        onClose={closeTaskModal}
        users={teamMembers}
        projects={projects}
        onSubmit={handleCreateTask}
      />

      <ClientModal
        opened={clientModalOpened}
        onClose={closeClientModal}
        onSubmit={handleCreateClient}
      />
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProviders>
        <DashboardApp />
      </AppProviders>
    </AuthProvider>
  );
}
