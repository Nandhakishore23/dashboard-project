import React from 'react';
import { useSocket } from '../context/SocketContext';
import { format, parseISO } from 'date-fns';
import { ActivityLog } from '../types';

const actionIcons: Record<string, string> = {
  PROJECT_CREATED: '📁',
  PROJECT_UPDATED: '✏️',
  PROJECT_DELETED: '🗑️',
  TASK_CREATED: '✨',
  TASK_UPDATED: '🔄',
  TASK_DELETED: '🗑️',
  TASK_STATUS_CHANGED: '📋',
  TASK_ASSIGNED: '👤',
  TASK_OVERDUE: '⚠️',
};

export const ActivityFeed: React.FC = () => {
  const { activities, isConnected } = useSocket();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Activity Feed</h2>
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-500">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto">
        {activities.map((activity: ActivityLog) => (
          <div
            key={activity.id}
            className="p-4 border-b last:border-b-0 hover:bg-gray-50"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">
                {actionIcons[activity.action] || '📌'}
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-900">{activity.details || activity.action}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-gray-700">
                    {activity.user.name}
                  </span>
                  {activity.project && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">
                        {activity.project.name}
                      </span>
                    </>
                  )}
                  {activity.task && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs text-gray-500">
                        {activity.task.title}
                      </span>
                    </>
                  )}
                </div>
                <span className="text-xs text-gray-400 mt-1 block">
                  {format(parseISO(activity.createdAt), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <p>No activity yet</p>
            <p className="text-sm mt-1">Activity will appear here in real-time</p>
          </div>
        )}
      </div>
    </div>
  );
};
