import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useCallback, useMemo, useState } from 'react';
import { ProfilePage } from './components/account/ProfilePage';
import { SettingsPage } from './components/account/SettingsPage';
import { LoginPage } from './components/auth/LoginPage';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { ClientModal } from './components/forms/ClientModal';
import { TaskModal } from './components/forms/TaskModal';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { AppLayout, AuthLoadingScreen } from './components/layout/AppLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MOCK_METRICS, MOCK_PROJECTS, MOCK_TASKS, MOCK_USERS } from './data/mockData';
import { useAsyncData } from './hooks/useAsyncData';
import type { Client, Project, Task, TaskStatus, ViewId } from './types';
import { AppProviders } from './AppProviders';

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Por Hacer',
  'in-progress': 'En Progreso',
  done: 'Completado',
};

function generateId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function DashboardApp() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeView, setActiveView] = useState<ViewId>('analytics');
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  const [taskModalOpened, { open: openTaskModal, close: closeTaskModal }] = useDisclosure(false);
  const [clientModalOpened, { open: openClientModal, close: closeClientModal }] = useDisclosure(false);

  const analyticsData = useMemo(
    () => ({ metrics: MOCK_METRICS, projects }),
    [projects],
  );

  const kanbanData = useMemo(
    () => ({ tasks, users: MOCK_USERS }),
    [tasks],
  );

  const { loading: analyticsLoading, reload: reloadAnalytics } = useAsyncData({
    data: analyticsData,
    delay: 1000,
    enabled: activeView === 'analytics',
  });

  const { loading: kanbanLoading, reload: reloadKanban } = useAsyncData({
    data: kanbanData,
    delay: 1000,
    enabled: activeView === 'kanban',
  });

  const handleNavigate = useCallback(
    (view: ViewId) => {
      setActiveView(view);
      if (view === 'analytics') {
        reloadAnalytics();
      } else if (view === 'kanban') {
        reloadKanban();
      }
    },
    [reloadAnalytics, reloadKanban],
  );

  const handleOpenProfile = useCallback(() => setActiveView('profile'), []);
  const handleOpenSettings = useCallback(() => setActiveView('settings'), []);

  const handleLogout = useCallback(() => {
    setActiveView('analytics');
    logout();
  }, [logout]);

  const handleCreateTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt'>) => {
      const newTask: Task = {
        ...taskData,
        id: generateId('t'),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [],
  );

  const handleMoveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return prev;

      notifications.show({
        title: 'Estado actualizado',
        message: `"${task.title}" movida a ${STATUS_LABELS[newStatus]}.`,
        color: 'indigo',
        icon: <IconArrowRight size={18} stroke={1.5} />,
      });

      return prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
    });
  }, []);

  const handleCreateClient = useCallback(
    (clientData: Omit<Client, 'id'>) => {
      const newProject: Project = {
        id: generateId('p'),
        name: `Proyecto — ${clientData.company}`,
        client: clientData.name,
        status: 'active',
        progress: 0,
        budget: clientData.plan === 'enterprise' ? 80000 : clientData.plan === 'professional' ? 45000 : 20000,
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        teamSize: 3,
      };
      setProjects((prev) => [newProject, ...prev]);

      notifications.show({
        title: 'Proyecto creado',
        message: `Se generó automáticamente el proyecto para ${clientData.company}.`,
        color: 'teal',
        icon: <IconCheck size={18} stroke={1.5} />,
      });
    },
    [],
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
            metrics={analyticsData.metrics}
            projects={analyticsData.projects}
            loading={analyticsLoading}
            onAddClient={openClientModal}
          />
        );
      case 'kanban':
        return (
          <KanbanBoard
            tasks={kanbanData.tasks}
            users={kanbanData.users}
            loading={kanbanLoading}
            onCreateTask={openTaskModal}
            onMoveTask={handleMoveTask}
          />
        );
      case 'profile':
        return <ProfilePage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return null;
    }
  };

  return (
    <AppLayout
      activeView={activeView}
      user={user}
      onNavigate={handleNavigate}
      onOpenProfile={handleOpenProfile}
      onOpenSettings={handleOpenSettings}
      onLogout={handleLogout}
    >
      {renderContent()}

      <TaskModal
        opened={taskModalOpened}
        onClose={closeTaskModal}
        users={MOCK_USERS}
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
