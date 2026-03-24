import cron from 'node-cron';
import prisma from '../config/database.js';
import { emitNotification } from './socket.service.js';

export const startOverdueTaskChecker = (): void => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] Running overdue task check...');

    try {
      const now = new Date();
      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: {
            lt: now,
          },
          status: {
            not: 'DONE',
          },
          isOverdue: false,
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          project: {
            select: { name: true },
          },
        },
      });

      for (const task of overdueTasks) {
        await prisma.task.update({
          where: { id: task.id },
          data: { isOverdue: true },
        });

        await prisma.activityLog.create({
          data: {
            action: 'TASK_OVERDUE',
            details: `Task "${task.title}" is now overdue`,
            userId: task.assignedTo?.id || 'system',
            taskId: task.id,
            projectId: task.projectId,
          },
        });

        if (task.assignedTo) {
          await emitNotification(
            task.assignedTo.id,
            `Task "${task.title}" in project "${task.project.name}" is now overdue`,
            'OVERDUE'
          );
        }
      }

      if (overdueTasks.length > 0) {
        console.log(`[CRON] Marked ${overdueTasks.length} tasks as overdue`);
      }
    } catch (error) {
      console.error('[CRON] Error checking overdue tasks:', error);
    }
  });

  console.log('[CRON] Overdue task checker scheduled (every 5 minutes)');
};

export const startDailyDigest = (): void => {
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Sending daily digest...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const tasksDueSoon = await prisma.task.findMany({
        where: {
          dueDate: {
            gte: tomorrow,
            lt: dayAfterTomorrow,
          },
          status: {
            not: 'DONE',
          },
        },
        include: {
          assignedTo: {
            select: { id: true, name: true },
          },
        },
      });

      const notifications = new Map<string, string[]>();

      for (const task of tasksDueSoon) {
        if (task.assignedTo) {
          const message = `Reminder: "${task.title}" is due tomorrow`;
          await emitNotification(task.assignedTo.id, message, 'DUE_SOON');
        }
      }

      console.log(`[CRON] Sent ${tasksDueSoon.length} daily digest notifications`);
    } catch (error) {
      console.error('[CRON] Error sending daily digest:', error);
    }
  });

  console.log('[CRON] Daily digest scheduled (9 AM daily)');
};
