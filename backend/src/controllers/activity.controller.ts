import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { Role } from '../types/index.js';

export const getActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    let where: Record<string, unknown> = {};

    if (userRole === Role.DEVELOPER) {
      where = {
        OR: [
          { task: { assignedToId: userId } },
          { userId },
        ],
      };
    } else if (userRole === Role.PM) {
      const ownedProjects = await prisma.project.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      where = {
        projectId: { in: ownedProjects.map((p) => p.id) },
      };
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.activityLog.count({ where }),
    ]);

    res.json({
      activities,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to get activities', code: 500 });
  }
};

export const getProjectActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: { projectId },
        include: {
          user: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.activityLog.count({ where: { projectId } }),
    ]);

    res.json({
      activities,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Get project activities error:', error);
    res.status(500).json({ error: 'Failed to get activities', code: 500 });
  }
};
