import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

export const sql = neon(process.env.DATABASE_URL!);

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL DEFAULT 'Usuario',
      avatar VARCHAR(10) NOT NULL DEFAULT 'US',
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      phone VARCHAR(50) NOT NULL DEFAULT '',
      bio TEXT NOT NULL DEFAULT '',
      department VARCHAR(100) NOT NULL DEFAULT 'General',
      is_admin BOOLEAN NOT NULL DEFAULT false,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false`;

  await sql`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      email_notifications BOOLEAN NOT NULL DEFAULT true,
      push_notifications BOOLEAN NOT NULL DEFAULT false,
      language VARCHAR(5) NOT NULL DEFAULT 'es',
      color_scheme VARCHAR(10) NOT NULL DEFAULT 'light'
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS team_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL,
      avatar VARCHAR(10) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      plan VARCHAR(20) NOT NULL,
      start_date DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      progress INTEGER NOT NULL DEFAULT 0,
      budget NUMERIC(12, 2) NOT NULL DEFAULT 0,
      deadline DATE NOT NULL,
      team_size INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      status VARCHAR(20) NOT NULL DEFAULT 'todo',
      priority VARCHAR(20) NOT NULL DEFAULT 'medium',
      assignee_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      tags TEXT[] NOT NULL DEFAULT '{}',
      due_date DATE NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ
    )
  `;

  await seedAuthUsers();
  await seedBusinessData();
}

async function seedAuthUsers() {
  const demoEmail = 'demo@gmail.com';
  const existingDemo = await sql`SELECT id FROM users WHERE email = ${demoEmail} LIMIT 1`;

  if (existingDemo.length === 0) {
    const passwordHash = await bcrypt.hash('Demo123', 10);
    const rows = await sql`
      INSERT INTO users (email, password_hash, name, role, avatar, phone, bio, department, is_admin)
      VALUES (
        ${demoEmail},
        ${passwordHash},
        ${'Usuario Demo'},
        ${'Product Manager'},
        ${'UD'},
        ${''},
        ${'Cuenta de demostración de SaaSFlow.'},
        ${'Producto'},
        ${false}
      )
      RETURNING id
    `;

    await sql`INSERT INTO user_settings (user_id) VALUES (${rows[0].id})`;
  }

  const adminEmail = 'admin@saasflow.io';
  const existingAdmin = await sql`SELECT id FROM users WHERE email = ${adminEmail} LIMIT 1`;

  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.hash('Admin123', 10);
    const rows = await sql`
      INSERT INTO users (email, password_hash, name, role, avatar, phone, bio, department, is_admin)
      VALUES (
        ${adminEmail},
        ${passwordHash},
        ${'Administrador SaaSFlow'},
        ${'Superusuario'},
        ${'SA'},
        ${''},
        ${'Cuenta de superusuario con acceso total a la plataforma.'},
        ${'Dirección'},
        ${true}
      )
      RETURNING id
    `;

    await sql`INSERT INTO user_settings (user_id) VALUES (${rows[0].id})`;
  }
}

async function seedBusinessData() {
  const [{ count: clientCount }] = await sql`SELECT COUNT(*)::int AS count FROM clients`;
  if (Number(clientCount) > 0) return;

  const teamSeed = [
    { name: 'Ana García', role: 'Product Manager', avatar: 'AG', status: 'active', joinedDaysAgo: 500 },
    { name: 'Carlos Ruiz', role: 'Lead Developer', avatar: 'CR', status: 'active', joinedDaysAgo: 800 },
    { name: 'María López', role: 'UX Designer', avatar: 'ML', status: 'active', joinedDaysAgo: 550 },
    { name: 'Diego Fernández', role: 'DevOps Engineer', avatar: 'DF', status: 'inactive', joinedDaysAgo: 1300 },
    { name: 'Laura Martínez', role: 'QA Analyst', avatar: 'LM', status: 'active', joinedDaysAgo: 45 },
    { name: 'Roberto Sánchez', role: 'Backend Developer', avatar: 'RS', status: 'active', joinedDaysAgo: 780 },
    { name: 'Valentina Torres', role: 'Frontend Developer', avatar: 'VT', status: 'active', joinedDaysAgo: 210 },
    { name: 'Javier Morales', role: 'Data Analyst', avatar: 'JM', status: 'active', joinedDaysAgo: 120 },
  ];

  const teamIds: string[] = teamSeed.map(() => randomUUID());

  const clientSeed = [
    { name: 'Jorge Villareal', email: 'contacto@technova.mx', company: 'TechNova', plan: 'enterprise', startDaysAgo: 210 },
    { name: 'Patricia Nuñez', email: 'info@databridge.com', company: 'DataBridge', plan: 'professional', startDaysAgo: 180 },
    { name: 'Fernando Castillo', email: 'hola@capitalonemx.com', company: 'CapitalOne MX', plan: 'enterprise', startDaysAgo: 150 },
    { name: 'Camila Rivas', email: 'equipo@insightlab.io', company: 'InsightLab', plan: 'starter', startDaysAgo: 95 },
    { name: 'Ricardo Peña', email: 'contacto@connecthub.com', company: 'ConnectHub', plan: 'professional', startDaysAgo: 70 },
    { name: 'Sofía Ibarra', email: 'ventas@logipro.mx', company: 'LogiPro', plan: 'professional', startDaysAgo: 55 },
    { name: 'Emilio Duarte', email: 'contacto@edusmart.io', company: 'EduSmart', plan: 'starter', startDaysAgo: 40 },
    { name: 'Renata Solís', email: 'info@salesforcemx.com', company: 'SalesForce MX', plan: 'enterprise', startDaysAgo: 25 },
    { name: 'Alberto Gil', email: 'contacto@nimbuscloud.io', company: 'NimbusCloud', plan: 'starter', startDaysAgo: 10 },
    { name: 'Daniela Rey', email: 'hola@vertexpay.com', company: 'VertexPay', plan: 'professional', startDaysAgo: 3 },
  ];

  const clientIds: string[] = clientSeed.map(() => randomUUID());

  const projectSeed = [
    { name: 'Portal de Clientes v2', clientIdx: 0, status: 'active', progress: 72, budget: 45000, deadlineDays: 30, teamSize: 6, createdDaysAgo: 200 },
    { name: 'Migración Cloud', clientIdx: 1, status: 'active', progress: 45, budget: 82000, deadlineDays: 85, teamSize: 4, createdDaysAgo: 170 },
    { name: 'App Móvil Finanzas', clientIdx: 2, status: 'paused', progress: 30, budget: 62000, deadlineDays: 140, teamSize: 5, createdDaysAgo: 140 },
    { name: 'Dashboard BI', clientIdx: 3, status: 'completed', progress: 100, budget: 28000, deadlineDays: -60, teamSize: 3, createdDaysAgo: 90 },
    { name: 'API Gateway', clientIdx: 4, status: 'active', progress: 58, budget: 35000, deadlineDays: 55, teamSize: 4, createdDaysAgo: 65 },
    { name: 'Sistema de Inventario', clientIdx: 5, status: 'active', progress: 15, budget: 41000, deadlineDays: 160, teamSize: 7, createdDaysAgo: 50 },
    { name: 'Plataforma E-learning', clientIdx: 6, status: 'paused', progress: 22, budget: 55000, deadlineDays: 120, teamSize: 5, createdDaysAgo: 38 },
    { name: 'CRM Interno', clientIdx: 7, status: 'completed', progress: 100, budget: 19000, deadlineDays: -100, teamSize: 2, createdDaysAgo: 22 },
    { name: 'Onboarding Automatizado', clientIdx: 8, status: 'active', progress: 8, budget: 24000, deadlineDays: 100, teamSize: 3, createdDaysAgo: 9 },
    { name: 'Reporting en Tiempo Real', clientIdx: 9, status: 'active', progress: 5, budget: 31000, deadlineDays: 110, teamSize: 4, createdDaysAgo: 2 },
  ];

  const projectIds: string[] = projectSeed.map(() => randomUUID());

  const taskSeed = [
    { title: 'Diseñar wireframes del dashboard', description: 'Crear prototipos de alta fidelidad para la vista principal de analítica.', status: 'done', priority: 'high', assigneeIdx: 2, projectIdx: 0, tags: ['design', 'ux'], dueDays: -15, createdDaysAgo: 55, completedDaysAgo: 20 },
    { title: 'Implementar autenticación OAuth', description: 'Integrar proveedores Google y Microsoft con refresh tokens.', status: 'in-progress', priority: 'critical', assigneeIdx: 1, projectIdx: 0, tags: ['backend', 'security'], dueDays: 5, createdDaysAgo: 40, completedDaysAgo: null },
    { title: 'Configurar pipeline CI/CD', description: 'Automatizar despliegues en staging y producción con GitHub Actions.', status: 'in-progress', priority: 'high', assigneeIdx: 3, projectIdx: 1, tags: ['devops', 'automation'], dueDays: 8, createdDaysAgo: 35, completedDaysAgo: null },
    { title: 'Escribir tests E2E', description: 'Cobertura de flujos críticos con Playwright.', status: 'todo', priority: 'medium', assigneeIdx: 4, projectIdx: 0, tags: ['testing', 'qa'], dueDays: 20, createdDaysAgo: 30, completedDaysAgo: null },
    { title: 'Optimizar consultas SQL', description: 'Reducir tiempos de respuesta en reportes de analítica.', status: 'todo', priority: 'high', assigneeIdx: 5, projectIdx: 4, tags: ['database', 'performance'], dueDays: 12, createdDaysAgo: 28, completedDaysAgo: null },
    { title: 'Documentar API REST', description: 'Generar especificación OpenAPI 3.0 con ejemplos.', status: 'todo', priority: 'low', assigneeIdx: 1, projectIdx: 4, tags: ['docs', 'api'], dueDays: 25, createdDaysAgo: 26, completedDaysAgo: null },
    { title: 'Revisión de accesibilidad WCAG', description: 'Auditar componentes UI y corregir problemas de contraste y navegación.', status: 'done', priority: 'medium', assigneeIdx: 2, projectIdx: 3, tags: ['a11y', 'ux'], dueDays: -40, createdDaysAgo: 80, completedDaysAgo: 45 },
    { title: 'Migrar base de datos a Neon', description: 'Ejecutar migración con downtime mínimo y validar integridad.', status: 'done', priority: 'critical', assigneeIdx: 3, projectIdx: 1, tags: ['database', 'devops'], dueDays: -25, createdDaysAgo: 60, completedDaysAgo: 18 },
    { title: 'Diseñar sistema de componentes', description: 'Crear librería de componentes reutilizables en Mantine.', status: 'done', priority: 'medium', assigneeIdx: 6, projectIdx: 0, tags: ['design', 'frontend'], dueDays: -10, createdDaysAgo: 50, completedDaysAgo: 12 },
    { title: 'Integrar pasarela de pagos', description: 'Conectar Stripe para cobros recurrentes por plan.', status: 'in-progress', priority: 'critical', assigneeIdx: 5, projectIdx: 5, tags: ['backend', 'security'], dueDays: 10, createdDaysAgo: 22, completedDaysAgo: null },
    { title: 'Refactorizar módulo de reportes', description: 'Reducir complejidad ciclomática y mejorar cobertura de tests.', status: 'todo', priority: 'medium', assigneeIdx: 1, projectIdx: 5, tags: ['backend', 'testing'], dueDays: 18, createdDaysAgo: 20, completedDaysAgo: null },
    { title: 'Configurar alertas de monitoreo', description: 'Definir umbrales y notificaciones para errores en producción.', status: 'todo', priority: 'high', assigneeIdx: 3, projectIdx: 5, tags: ['devops', 'performance'], dueDays: 15, createdDaysAgo: 19, completedDaysAgo: null },
    { title: 'Rediseñar flujo de onboarding', description: 'Simplificar los pasos iniciales para nuevos clientes.', status: 'in-progress', priority: 'high', assigneeIdx: 6, projectIdx: 6, tags: ['design', 'ux'], dueDays: 22, createdDaysAgo: 17, completedDaysAgo: null },
    { title: 'Implementar exportación a CSV', description: 'Permitir exportar reportes de analítica en formato CSV.', status: 'todo', priority: 'low', assigneeIdx: 7, projectIdx: 6, tags: ['frontend', 'api'], dueDays: 30, createdDaysAgo: 16, completedDaysAgo: null },
    { title: 'Auditoría de seguridad', description: 'Revisar dependencias y endpoints en busca de vulnerabilidades.', status: 'todo', priority: 'critical', assigneeIdx: 3, projectIdx: 7, tags: ['security'], dueDays: 6, createdDaysAgo: 15, completedDaysAgo: null },
    { title: 'Optimizar imágenes y assets', description: 'Reducir el peso de la página principal para mejorar LCP.', status: 'done', priority: 'low', assigneeIdx: 6, projectIdx: 7, tags: ['performance', 'frontend'], dueDays: -5, createdDaysAgo: 21, completedDaysAgo: 6 },
    { title: 'Configurar entorno de staging', description: 'Replicar producción para pruebas previas al release.', status: 'in-progress', priority: 'medium', assigneeIdx: 3, projectIdx: 8, tags: ['devops'], dueDays: 14, createdDaysAgo: 8, completedDaysAgo: null },
    { title: 'Levantar requerimientos con cliente', description: 'Sesión de descubrimiento con el equipo de NimbusCloud.', status: 'done', priority: 'medium', assigneeIdx: 0, projectIdx: 8, tags: ['docs'], dueDays: -3, createdDaysAgo: 9, completedDaysAgo: 4 },
    { title: 'Prototipo de dashboard en tiempo real', description: 'Validar arquitectura de websockets para métricas live.', status: 'todo', priority: 'high', assigneeIdx: 7, projectIdx: 9, tags: ['frontend', 'performance'], dueDays: 25, createdDaysAgo: 2, completedDaysAgo: null },
    { title: 'Definir esquema de analítica', description: 'Modelar tablas y agregaciones para el nuevo reporting.', status: 'todo', priority: 'medium', assigneeIdx: 5, projectIdx: 9, tags: ['database', 'docs'], dueDays: 28, createdDaysAgo: 2, completedDaysAgo: null },
    { title: 'Corregir bug de doble envío en formularios', description: 'El botón de guardar permite doble submit en conexiones lentas.', status: 'in-progress', priority: 'high', assigneeIdx: 6, projectIdx: 2, tags: ['frontend', 'testing'], dueDays: 4, createdDaysAgo: 12, completedDaysAgo: null },
    { title: 'Actualizar dependencias mayores', description: 'Subir React, Vite y Mantine a las últimas versiones estables.', status: 'todo', priority: 'low', assigneeIdx: 1, projectIdx: 2, tags: ['frontend', 'devops'], dueDays: 35, createdDaysAgo: 11, completedDaysAgo: null },
    { title: 'Sesión de retroalimentación con QA', description: 'Revisar hallazgos del último sprint de pruebas.', status: 'done', priority: 'low', assigneeIdx: 4, projectIdx: 3, tags: ['qa'], dueDays: -30, createdDaysAgo: 70, completedDaysAgo: 35 },
    { title: 'Plan de escalabilidad de base de datos', description: 'Evaluar particionamiento y réplicas de lectura.', status: 'todo', priority: 'medium', assigneeIdx: 5, projectIdx: 1, tags: ['database', 'performance'], dueDays: 40, createdDaysAgo: 6, completedDaysAgo: null },
  ];

  const queries = [
    ...teamSeed.map((member, i) =>
      sql`
        INSERT INTO team_members (id, name, role, avatar, status, joined_at)
        VALUES (${teamIds[i]}, ${member.name}, ${member.role}, ${member.avatar}, ${member.status}, ${daysAgo(member.joinedDaysAgo)})
      `,
    ),
    ...clientSeed.map((client, i) =>
      sql`
        INSERT INTO clients (id, name, email, company, plan, start_date, created_at)
        VALUES (
          ${clientIds[i]},
          ${client.name},
          ${client.email},
          ${client.company},
          ${client.plan},
          ${daysAgo(client.startDaysAgo).split('T')[0]},
          ${daysAgo(client.startDaysAgo)}
        )
      `,
    ),
    ...projectSeed.map((project, i) =>
      sql`
        INSERT INTO projects (id, name, client_id, status, progress, budget, deadline, team_size, created_at)
        VALUES (
          ${projectIds[i]},
          ${project.name},
          ${clientIds[project.clientIdx]},
          ${project.status},
          ${project.progress},
          ${project.budget},
          ${daysFromNow(project.deadlineDays)},
          ${project.teamSize},
          ${daysAgo(project.createdDaysAgo)}
        )
      `,
    ),
    ...taskSeed.map((task) => {
      const completedAt = task.completedDaysAgo !== null ? daysAgo(task.completedDaysAgo) : null;
      return sql`
        INSERT INTO tasks (title, description, status, priority, assignee_id, project_id, tags, due_date, created_at, completed_at)
        VALUES (
          ${task.title},
          ${task.description},
          ${task.status},
          ${task.priority},
          ${teamIds[task.assigneeIdx]},
          ${projectIds[task.projectIdx]},
          ${task.tags},
          ${daysFromNow(task.dueDays)},
          ${daysAgo(task.createdDaysAgo)},
          ${completedAt}
        )
      `;
    }),
  ];

  await sql.transaction(queries);
}

export interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  phone: string;
  bio: string;
  department: string;
  is_admin: boolean;
  joined_at: string;
}

export interface SettingsRow {
  email_notifications: boolean;
  push_notifications: boolean;
  language: string;
  color_scheme: string;
}
