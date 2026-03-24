import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { JwtPayload, Role } from '../types/index.js';
import prisma from '../config/database.js';
import { verifyAccessToken } from '../services/auth.service.js';

interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}

let io: Server;

export const initializeSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.cookie?.split('=')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const user = socket.user!;
    console.log(`User connected: ${user.email} (${user.role})`);

    await handleUserConnection(socket, user);
    await sendCatchUpEvents(socket, user);
    await joinRelevantRooms(socket, user);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.email}`);
    });
  });

  return io;
};

const handleUserConnection = async (socket: AuthenticatedSocket, user: JwtPayload): Promise<void> => {
  const unreadCount = await prisma.notification.count({
    where: {
      userId: user.userId,
      isRead: false,
    },
  });

  socket.emit('notification:count', { count: unreadCount });
};

const sendCatchUpEvents = async (socket: AuthenticatedSocket, user: JwtPayload): Promise<void> => {
  let activities;

  switch (user.role) {
    case Role.ADMIN:
      activities = await prisma.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          project: { select: { name: true } },
          task: { select: { title: true } },
        },
      });
      break;

    case Role.PM:
      activities = await prisma.activityLog.findMany({
        where: {
          project: {
            ownerId: user.userId,
          },
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          project: { select: { name: true } },
          task: { select: { title: true } },
        },
      });
      break;

    case Role.DEVELOPER:
      activities = await prisma.activityLog.findMany({
        where: {
          OR: [
            { task: { assignedToId: user.userId } },
            { userId: user.userId },
          ],
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          project: { select: { name: true } },
          task: { select: { title: true } },
        },
      });
      break;

    default:
      activities = [];
  }

  socket.emit('activity:catchup', { activities });
};

const joinRelevantRooms = async (socket: AuthenticatedSocket, user: JwtPayload): Promise<void> => {
  socket.join(`user:${user.userId}`);

  if (user.role === Role.ADMIN) {
    socket.join('room:admin');
  }

  if (user.role === Role.PM) {
    const projects = await prisma.project.findMany({
      where: { ownerId: user.userId },
      select: { id: true },
    });
    projects.forEach((project) => {
      socket.join(`project:${project.id}`);
    });
  }

  if (user.role === Role.DEVELOPER) {
    const tasks = await prisma.task.findMany({
      where: { assignedToId: user.userId },
      select: { id: true, projectId: true },
    });
    tasks.forEach((task) => {
      socket.join(`task:${task.id}`);
      socket.join(`project:${task.projectId}`);
    });
  }
};

export const emitActivity = async (
  action: string,
  userId: string,
  projectId?: string,
  taskId?: string,
  details?: string
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const activity = await prisma.activityLog.create({
    data: {
      action,
      details,
      userId,
      projectId,
      taskId,
    },
    include: {
      user: { select: { name: true } },
      project: { select: { name: true } },
      task: { select: { title: true } },
    },
  });

  const project = activity.project ? await prisma.project.findUnique({
    where: { id: activity.projectId! },
    include: { owner: { select: { id: true } } },
  }) : null;

  io.to('room:admin').emit('activity:new', { activity });

  if (project?.ownerId) {
    io.to(`user:${project.ownerId}`).emit('activity:new', { activity });
  }

  if (taskId) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { assignedToId: true },
    });
    if (task?.assignedToId) {
      io.to(`user:${task.assignedToId}`).emit('activity:new', { activity });
    }
  }
};

export const emitNotification = async (
  userId: string,
  message: string,
  type: string
): Promise<void> => {
  const notification = await prisma.notification.create({
    data: {
      message,
      type,
      userId,
    },
  });

  io.to(`user:${userId}`).emit('notification:new', { notification });

  const unreadCount = await prisma.notification.count({
    where: { userId, isRead: false },
  });

  io.to(`user:${userId}`).emit('notification:count', { count: unreadCount });
};

export const getIO = (): Server => io;
