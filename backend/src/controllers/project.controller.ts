import { Request, Response } from 'express';
import prisma from '../config/database.js';
import { emitActivity } from '../services/socket.service.js';
import { Role } from '../types/index.js';

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = req.user!.userId;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await emitActivity('PROJECT_CREATED', userId, project.id, undefined, `Created project: ${name}`);

    res.status(201).json({ project, message: 'Project created successfully' });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project', code: 500 });
  }
};

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    let projects;

    switch (userRole) {
      case Role.ADMIN:
        projects = await prisma.project.findMany({
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { tasks: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      case Role.PM:
        projects = await prisma.project.findMany({
          where: { ownerId: userId },
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { tasks: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      case Role.DEVELOPER:
        projects = await prisma.project.findMany({
          where: {
            tasks: {
              some: { assignedToId: userId },
            },
          },
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { tasks: true } },
          },
          orderBy: { createdAt: 'desc' },
        });
        break;

      default:
        projects = [];
    }

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to get projects', code: 500 });
  }
};

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found', code: 404 });
      return;
    }

    if (userRole === Role.PM && project.ownerId !== userId) {
      res.status(403).json({ 
        error: 'You do not have access to this project',
        code: 403 
      });
      return;
    }

    if (userRole === Role.DEVELOPER) {
      const hasAccess = await prisma.task.findFirst({
        where: {
          projectId: id,
          assignedToId: userId,
        },
      });

      if (!hasAccess) {
        res.status(403).json({ 
          error: 'You do not have access to this project',
          code: 403 
        });
        return;
      }
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to get project', code: 500 });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user!.userId;

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    await emitActivity('PROJECT_UPDATED', userId, id, undefined, `Updated project: ${name}`);

    res.json({ project, message: 'Project updated successfully' });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project', code: 500 });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const project = await prisma.project.findUnique({
      where: { id },
      select: { name: true },
    });

    await prisma.project.delete({
      where: { id },
    });

    await emitActivity('PROJECT_DELETED', userId, id, undefined, `Deleted project: ${project?.name}`);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project', code: 500 });
  }
};
