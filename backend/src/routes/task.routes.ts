import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getMyTasks,
} from '../controllers/task.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requirePMOrAdmin } from '../middleware/auth.middleware.js';
import { checkTaskAccess } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/', requirePMOrAdmin, createTask);
router.get('/', getTasks);
router.get('/my', getMyTasks);
router.get('/:id', checkTaskAccess, getTaskById);
router.put('/:id', checkTaskAccess, updateTask);
router.delete('/:id', checkTaskAccess, deleteTask);

export default router;
