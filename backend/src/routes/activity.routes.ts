import { Router } from 'express';
import { getActivities, getProjectActivities } from '../controllers/activity.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getActivities);
router.get('/project/:projectId', getProjectActivities);

export default router;
