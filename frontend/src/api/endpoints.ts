import api from './client';
import { User, Project, Task, Notification, ActivityLog, TaskFilters } from '../types';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; accessToken: string }>('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  refresh: () => api.post<{ accessToken: string }>('/auth/refresh'),

  getMe: () => api.get<{ user: User }>('/auth/me'),

  register: (data: { email: string; password: string; name: string; role: string }) =>
    api.post<{ user: User }>('/auth/register', data),

  getUsers: () => api.get<{ users: User[] }>('/auth/users'),
};

export const projectApi = {
  getAll: () => api.get<{ projects: Project[] }>('/projects'),

  getById: (id: string) => api.get<{ project: Project }>(`/projects/${id}`),

  create: (data: { name: string; description?: string }) =>
    api.post<{ project: Project }>('/projects', data),

  update: (id: string, data: { name?: string; description?: string }) =>
    api.put<{ project: Project }>(`/projects/${id}`, data),

  delete: (id: string) => api.delete(`/projects/${id}`),
};

export const taskApi = {
  getAll: (filters?: TaskFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    return api.get<{ tasks: Task[] }>(`/tasks?${params.toString()}`);
  },

  getMyTasks: () => api.get<{ tasks: Task[] }>('/tasks/my'),

  getById: (id: string) => api.get<{ task: Task }>(`/tasks/${id}`),

  create: (data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    projectId: string;
    assignedToId?: string;
  }) => api.post<{ task: Task }>('/tasks', data),

  update: (
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
      assignedToId?: string;
    }
  ) => api.put<{ task: Task }>(`/tasks/${id}`, data),

  delete: (id: string) => api.delete(`/tasks/${id}`),
};

export const notificationApi = {
  getAll: (page = 1, limit = 20) =>
    api.get<{ notifications: Notification[]; unreadCount: number }>(
      `/notifications?page=${page}&limit=${limit}`
    ),

  getUnreadCount: () => api.get<{ unreadCount: number }>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    api.put<{ unreadCount: number }>(`/notifications/${id}/read`),

  markAllAsRead: () => api.put<{ unreadCount: number }>('/notifications/read-all'),

  delete: (id: string) => api.delete(`/notifications/${id}`),
};

export const activityApi = {
  getAll: (page = 1, limit = 50) =>
    api.get<{ activities: ActivityLog[] }>(`/activities?page=${page}&limit=${limit}`),

  getProjectActivities: (projectId: string, page = 1, limit = 20) =>
    api.get<{ activities: ActivityLog[] }>(
      `/activities/project/${projectId}?page=${page}&limit=${limit}`
    ),
};
