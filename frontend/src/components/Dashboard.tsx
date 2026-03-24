import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTasks, useUpdateTask } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { useSocket } from '../context/SocketContext';
import { useUIStore } from '../store/uiStore';
import { usePermission } from './RequireRole';
import { TaskForm, DeleteTaskModal } from './TaskForm';
import { Task, TaskStatus, TaskPriority } from '../types';
import { format, parseISO } from 'date-fns';

const statusConfig: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  TODO: { label: 'To Do', color: 'text-gray-600', bg: 'bg-gray-100' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-100' },
  REVIEW: { label: 'Review', color: 'text-yellow-600', bg: 'bg-yellow-100' },
  DONE: { label: 'Done', color: 'text-green-600', bg: 'bg-green-100' },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  LOW: { label: 'Low', color: 'text-gray-500', bg: 'bg-gray-100' },
  MEDIUM: { label: 'Medium', color: 'text-blue-500', bg: 'bg-blue-100' },
  HIGH: { label: 'High', color: 'text-orange-500', bg: 'bg-orange-100' },
  URGENT: { label: 'Urgent', color: 'text-red-500', bg: 'bg-red-100' },
};

export const Dashboard: React.FC = () => {
  const [, setSearchParams] = useSearchParams();
  const { activities } = useSocket();
  const { filters, updateFilter, clearFilters } = useUIStore();
  const { canCreateTasks, canAssignTasks } = usePermission();
  const { data: tasks, isLoading } = useTasks(filters);
  const { data: projects } = useProjects();
  const updateTask = useUpdateTask();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.projectId) params.projectId = filters.projectId;
    if (filters.isOverdue) params.isOverdue = 'true';
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    if (value === '') {
      const newFilters = { ...filters };
      delete newFilters[key];
      updateFilter(key, undefined as never);
    } else {
      updateFilter(key, value as never);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask.mutateAsync({ id: taskId, data: { status: newStatus } });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = {
    total: tasks?.length || 0,
    todo: tasks?.filter(t => t.status === 'TODO').length || 0,
    inProgress: tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0,
    done: tasks?.filter(t => t.status === 'DONE').length || 0,
    overdue: tasks?.filter(t => t.isOverdue).length || 0,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Welcome back! Here's your project overview.</p>
        </div>
        {canCreateTasks && (
          <button
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold tracking-wide">New Task</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8 animate-slideIn">
        <div className="card p-6 border-t-4 border-indigo-500 flex flex-col justify-center">
          <div className="text-4xl font-extrabold text-slate-800 tracking-tight">{stats.total}</div>
          <div className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-widest">Total Tasks</div>
        </div>
        <div className="card p-6 border-t-4 border-slate-400 flex flex-col justify-center">
          <div className="text-4xl font-extrabold text-slate-600 tracking-tight">{stats.todo}</div>
          <div className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-widest">To Do</div>
        </div>
        <div className="card p-6 border-t-4 border-blue-500 flex flex-col justify-center">
          <div className="text-4xl font-extrabold text-blue-600 tracking-tight">{stats.inProgress}</div>
          <div className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-widest">In Progress</div>
        </div>
        <div className="card p-6 border-t-4 border-emerald-500 flex flex-col justify-center">
          <div className="text-4xl font-extrabold text-emerald-600 tracking-tight">{stats.done}</div>
          <div className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-widest">Done</div>
        </div>
        <div className="card p-6 border-t-4 border-rose-500 flex flex-col justify-center">
          <div className="text-4xl font-extrabold text-rose-600 tracking-tight">{stats.overdue}</div>
          <div className="text-sm font-semibold text-slate-500 mt-2 uppercase tracking-widest">Overdue</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="select w-auto"
          >
            <option value="">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="REVIEW">Review</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="select w-auto"
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={filters.projectId || ''}
            onChange={(e) => handleFilterChange('projectId', e.target.value)}
            className="select w-auto"
          >
            <option value="">All Projects</option>
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.isOverdue || false}
              onChange={(e) => handleFilterChange('isOverdue', e.target.checked ? 'true' : '')}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">Overdue only</span>
          </label>

          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              <span className="text-sm text-gray-500">{tasks?.length || 0} tasks</span>
            </div>
            <div className="p-4 space-y-3 bg-slate-50/50">
              {tasks?.map((task) => (
                <div
                  key={task.id}
                  className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer group"
                  onClick={() => {
                    if (canAssignTasks) {
                      setEditingTask(task);
                      setShowTaskForm(true);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                        {task.isOverdue && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 uppercase tracking-wider">Overdue</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-500 truncate flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                        {task.project.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${statusConfig[task.status].bg} ${statusConfig[task.status].color}`}>
                          {statusConfig[task.status].label}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${priorityConfig[task.priority].bg} ${priorityConfig[task.priority].color}`}>
                          {priorityConfig[task.priority].label}
                        </span>
                        {task.dueDate && (
                          <span className={`text-xs ml-auto font-medium ${task.isOverdue ? 'text-rose-500' : 'text-slate-400'}`}>
                            Due: {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    {canAssignTasks && (
                      <select
                        value={task.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(task.id, e.target.value as TaskStatus);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer hover:bg-white hover:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
              {(!tasks || tasks.length === 0) && (
                <div className="empty-state">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500">No tasks found</p>
                  {canCreateTasks && (
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setShowTaskForm(true);
                      }}
                      className="btn btn-primary mt-4"
                    >
                      Create your first task
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="card">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y max-h-[500px] overflow-y-auto">
              {activities.slice(0, 10).map((activity) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <p className="text-sm text-gray-900">{activity.details || activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{activity.user?.name}</span>
                    <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-400">
                      {format(parseISO(activity.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        task={editingTask}
      />
      <DeleteTaskModal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        task={deletingTask}
      />
    </div>
  );
};
