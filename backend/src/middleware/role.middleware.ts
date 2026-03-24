import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database.js';
import { Role } from '../types/index.js';

export const checkProjectOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.id || req.params.projectId;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required', code: 401 });
      return;
    }

    if (req.user?.role === Role.ADMIN) {
      next();
      return;
    }

    if (req.user?.role === Role.PM) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          ownerId: userId,
        },
      });

      if (!project) {
        res.status(403).json({ 
          error: 'You do not have access to this project. Only the project owner can perform this action.',
          code: 403 
        });
        return;
      }
    }

    if (req.user?.role === Role.DEVELOPER) {
      const task = await prisma.task.findFirst({
        where: {
          id: req.params.taskId || req.params.id,
          assignedToId: userId,
        },
      });

      if (!task) {
        res.status(403).json({ 
          error: 'You can only access tasks assigned to you',
          code: 403 
        });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed', code: 500 });
  }
};

export const checkTaskAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const taskId = req.params.id || req.params.taskId;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Authentication required', code: 401 });
      return;
    }

    if (req.user?.role === Role.ADMIN) {
      next();
      return;
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!task) {
      res.status(404).json({ error: 'Task not found', code: 404 });
      return;
    }

    if (req.user?.role === Role.PM) {
      if (task.project.ownerId !== userId) {
        res.status(403).json({ 
          error: 'You do not have access to this task',
          code: 403 
        });
        return;
      }
    }

    if (req.user?.role === Role.DEVELOPER) {
      if (task.assignedToId !== userId) {
        res.status(403).json({ 
          error: 'You can only access tasks assigned to you',
          code: 403 
        });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authorization check failed', code: 500 });
  }
};
