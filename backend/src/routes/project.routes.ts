import { Router } from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/project.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePMOrAdmin } from '../middleware/auth.middleware.js';
import { checkProjectOwnership } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', requirePMOrAdmin, createProject);
router.get('/', getProjects);
router.get('/:id', checkProjectOwnership, getProjectById);
router.put('/:id', checkProjectOwnership, updateProject);
router.delete('/:id', checkProjectOwnership, deleteProject);

export default router;
