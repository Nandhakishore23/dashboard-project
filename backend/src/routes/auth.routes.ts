import { Router } from 'express';
import { register, login, logout, refresh, getMe, getAllUsers } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);

router.get('/users', authenticate, requireAdmin, getAllUsers);

export default router;
