import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { emitActivity, emitNotification } from '../services/socket.service.js';
import { Role } from '../types/index.js';

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedToId } = req.body;
    const userId = req.user!.userId;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assignedToId,
      },
      include: {
        project: { select: { name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await emitActivity('TASK_CREATED', userId, projectId, task.id, `Created task: ${title}`);

    if (assignedToId && assignedToId !== userId) {
      await emitNotification(
        assignedToId,
        `You have been assigned to task: ${title}`,
        'TASK_ASSIGNED'
      );
    }

    res.status(201).json({ task, message: 'Task created successfully' });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task', code: 500 });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { status, priority, projectId, assignedToId, isOverdue, dueDateFrom, dueDateTo } = req.query;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = projectId;
    if (isOverdue !== undefined) where.isOverdue = isOverdue === 'true';
    if (assignedToId) where.assignedToId = assignedToId;

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {};
      if (dueDateFrom) (where.dueDate as Record<string, Date>).gte = new Date(dueDateFrom as string);
      if (dueDateTo) (where.dueDate as Record<string, Date>).lte = new Date(dueDateTo as string);
    }

    if (userRole === Role.DEVELOPER) {
      where.assignedToId = userId;
    }

    if (userRole === Role.PM) {
      const ownedProjects = await prisma.project.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      where.projectId = { in: ownedProjects.map((p) => p.id) };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: [
        { isOverdue: 'desc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks', code: 500 });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { 
          select: { 
            id: true, 
            name: true, 
            ownerId: true,
            owner: { select: { id: true, name: true } },
          } 
        },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found', code: 404 });
      return;
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to get task', code: 500 });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, assignedToId } = req.body;
    const userId = req.user!.userId;

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!existingTask) {
      res.status(404).json({ error: 'Task not found', code: 404 });
      return;
    }

    const wasOverdue = existingTask.isOverdue;
    const isNowOverdue = dueDate && new Date(dueDate) < new Date() && status !== 'DONE';

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToId,
        isOverdue: isNowOverdue || false,
      },
      include: {
        project: { select: { name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    await emitActivity('TASK_UPDATED', userId, task.projectId, id, `Updated task: ${title}`);

    if (assignedToId && assignedToId !== existingTask.assignedToId) {
      await emitNotification(
        assignedToId,
        `You have been assigned to task: ${title}`,
        'TASK_ASSIGNED'
      );
    }

    res.json({ task, message: 'Task updated successfully' });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task', code: 500 });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const task = await prisma.task.findUnique({
      where: { id },
      select: { title: true, projectId: true },
    });

    await prisma.task.delete({
      where: { id },
    });

    await emitActivity('TASK_DELETED', userId, task?.projectId, id, `Deleted task: ${task?.title}`);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task', code: 500 });
  }
};

export const getMyTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const tasks = await prisma.task.findMany({
      where: { assignedToId: userId },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: [
        { isOverdue: 'desc' },
        { priority: 'desc' },
        { dueDate: 'asc' },
      ],
    });

    res.json({ tasks });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks', code: 500 });
  }
};
