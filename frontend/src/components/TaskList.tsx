import React, { useState } from 'react';
import { useTasks, useUpdateTask } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { usePermission } from './RequireRole';
import { TaskStatus, TaskPriority } from '../types';
import { format, parseISO } from 'date-fns';

const statusColors: Record<TaskStatus, string> = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800',
};

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600',
};

export const TaskList: React.FC = () => {
  const { canAssignTasks } = usePermission();
  const { data: tasks, isLoading } = useTasks();
  const { isLoading: isProjectsLoading } = useProjects();
  const updateTask = useUpdateTask();
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingTasks((prev) => new Set(prev).add(taskId));
    try {
      await updateTask.mutateAsync({ id: taskId, data: { status: newStatus } });
    } finally {
      setUpdatingTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Tasks</h1>
          <p className="text-slate-500 font-medium mt-1">{tasks?.length || 0} active tasks requiring attention</p>
        </div>
        {canAssignTasks && (
          <button className="btn btn-primary shadow-indigo-500/25">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Create Task
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks?.map((task) => (
              <tr key={task.id} className={task.isOverdue ? 'bg-red-50' : ''}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    {task.isOverdue && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                        Overdue
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.project.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    disabled={updatingTasks.has(task.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-0 cursor-pointer transition-all duration-200 shadow-sm outline-none ring-2 ring-transparent focus:ring-indigo-500/20 ${statusColors[task.status]} ${
                      updatingTasks.has(task.id) ? 'opacity-50 animate-pulse' : 'hover:brightness-95'
                    }`}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.dueDate ? (
                    <span className={task.isOverdue ? 'text-red-600' : ''}>
                      {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  ) : (
                    'No due date'
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.assignedTo?.name || 'Unassigned'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!tasks || tasks.length === 0) && (
          <div className="p-8 text-center text-gray-500">No tasks found</div>
        )}
      </div>
    </div>
  );
};
