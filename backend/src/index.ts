import express from 'express';
import { createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Server } from 'socket.io';
import { initializeSocket } from './services/socket.service.js';
import { startOverdueTaskChecker, startDailyDigest } from './services/cron.service.js';
import {
  authRoutes,
  projectRoutes,
  taskRoutes,
  notificationRoutes,
  activityRoutes,
} from './routes/index.js';

const app = express();
const httpServer = createServer(app);
const io = initializeSocket(httpServer);

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', code: 500 });
});

startOverdueTaskChecker();
startDailyDigest();

const PORT = process.env.PORT || 4000;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
});

export { app, io };
