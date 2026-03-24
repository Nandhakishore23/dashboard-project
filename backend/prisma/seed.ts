import { PrismaClient, Role, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@company.com',
      password: hashedPassword,
      name: 'System Admin',
      role: Role.ADMIN,
    },
  });

  const pm1 = await prisma.user.create({
    data: {
      email: 'pm1@company.com',
      password: hashedPassword,
      name: 'Alice Manager',
      role: Role.PM,
    },
  });

  const pm2 = await prisma.user.create({
    data: {
      email: 'pm2@company.com',
      password: hashedPassword,
      name: 'Bob Manager',
      role: Role.PM,
    },
  });

  const dev1 = await prisma.user.create({
    data: {
      email: 'dev1@company.com',
      password: hashedPassword,
      name: 'Charlie Developer',
      role: Role.DEVELOPER,
    },
  });

  const dev2 = await prisma.user.create({
    data: {
      email: 'dev2@company.com',
      password: hashedPassword,
      name: 'Diana Developer',
      role: Role.DEVELOPER,
    },
  });

  const dev3 = await prisma.user.create({
    data: {
      email: 'dev3@company.com',
      password: hashedPassword,
      name: 'Eve Developer',
      role: Role.DEVELOPER,
    },
  });

  const dev4 = await prisma.user.create({
    data: {
      email: 'dev4@company.com',
      password: hashedPassword,
      name: 'Frank Developer',
      role: Role.DEVELOPER,
    },
  });

  console.log('Created users');

  const project1 = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform',
      description: 'Building a modern e-commerce platform with React and Node.js',
      ownerId: pm1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile Banking App',
      description: 'Developing a secure mobile banking application',
      ownerId: pm1.id,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Internal HR Portal',
      description: 'Creating an internal HR management portal',
      ownerId: pm2.id,
    },
  });

  console.log('Created projects');

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 5);

  const pastDate2 = new Date();
  pastDate2.setDate(pastDate2.getDate() - 3);

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 14);

  const task1 = await prisma.task.create({
    data: {
      title: 'Setup project infrastructure',
      description: 'Configure CI/CD, set up repository, initialize project structure',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      dueDate: pastDate,
      isOverdue: true,
      projectId: project1.id,
      assignedToId: dev1.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Implement user authentication',
      description: 'Build JWT-based authentication system with refresh tokens',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      dueDate: pastDate2,
      isOverdue: true,
      projectId: project1.id,
      assignedToId: dev2.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'Design database schema',
      description: 'Create PostgreSQL schema with Prisma for the e-commerce data',
      status: TaskStatus.REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureDate,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev1.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Build product catalog UI',
      description: 'Create responsive product listing and detail pages',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate2,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev3.id,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Implement shopping cart',
      description: 'Build shopping cart functionality with local storage',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate,
      isOverdue: false,
      projectId: project1.id,
      assignedToId: dev4.id,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      title: 'Setup banking API gateway',
      description: 'Configure API gateway for banking services',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      dueDate: futureDate,
      isOverdue: false,
      projectId: project2.id,
      assignedToId: dev2.id,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: 'Design HR dashboard',
      description: 'Create dashboard wireframes for HR management',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: futureDate2,
      isOverdue: false,
      projectId: project3.id,
      assignedToId: dev1.id,
    },
  });

  console.log('Created tasks (including 2 overdue)');

  await prisma.activityLog.createMany({
    data: [
      {
        action: 'PROJECT_CREATED',
        details: `Created project: ${project1.name}`,
        userId: pm1.id,
        projectId: project1.id,
      },
      {
        action: 'PROJECT_CREATED',
        details: `Created project: ${project2.name}`,
        userId: pm1.id,
        projectId: project2.id,
      },
      {
        action: 'PROJECT_CREATED',
        details: `Created project: ${project3.name}`,
        userId: pm2.id,
        projectId: project3.id,
      },
      {
        action: 'TASK_CREATED',
        details: `Created task: ${task1.title}`,
        userId: pm1.id,
        projectId: project1.id,
        taskId: task1.id,
      },
      {
        action: 'TASK_CREATED',
        details: `Created task: ${task2.title}`,
        userId: pm1.id,
        projectId: project1.id,
        taskId: task2.id,
      },
      {
        action: 'TASK_STATUS_CHANGED',
        details: `Moved "${task1.title}" to DONE`,
        userId: dev1.id,
        projectId: project1.id,
        taskId: task1.id,
      },
      {
        action: 'TASK_ASSIGNED',
        details: `Assigned "${task2.title}" to ${dev2.name}`,
        userId: pm1.id,
        projectId: project1.id,
        taskId: task2.id,
      },
    ],
  });

  console.log('Created activity logs');

  await prisma.notification.createMany({
    data: [
      {
        message: 'Welcome to the Dashboard!',
        type: 'SYSTEM',
        userId: admin.id,
      },
      {
        message: `You have been assigned to task: ${task1.title}`,
        type: 'TASK_ASSIGNED',
        userId: dev1.id,
      },
      {
        message: `You have been assigned to task: ${task2.title}`,
        type: 'TASK_ASSIGNED',
        userId: dev2.id,
      },
      {
        message: `Task "${task1.title}" is overdue`,
        type: 'OVERDUE',
        userId: dev1.id,
      },
      {
        message: `Task "${task2.title}" is overdue`,
        type: 'OVERDUE',
        userId: dev2.id,
      },
    ],
  });

  console.log('Created notifications');

  console.log('\n=== Seed Complete ===');
  console.log('\nLogin credentials:');
  console.log('Admin: admin@company.com / password123');
  console.log('PM 1: pm1@company.com / password123');
  console.log('PM 2: pm2@company.com / password123');
  console.log('Dev 1: dev1@company.com / password123');
  console.log('Dev 2: dev2@company.com / password123');
  console.log('Dev 3: dev3@company.com / password123');
  console.log('Dev 4: dev4@company.com / password123');
  console.log('\nProjects: 3');
  console.log('Tasks: 7 (2 overdue)');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
