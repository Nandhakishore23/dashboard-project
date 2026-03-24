export type Role = 'ADMIN' | 'PM' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner: Pick<User, 'id' | 'name' | 'email'>;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  isOverdue: boolean;
  projectId: string;
  project: Pick<Project, 'id' | 'name'>;
  assignedToId: string | null;
  assignedTo: Pick<User, 'id' | 'name' | 'email'> | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: string;
  isRead: boolean;
  userId: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
  projectId: string | null;
  project: Pick<Project, 'id' | 'name'> | null;
  taskId: string | null;
  task: Pick<Task, 'id' | 'title'> | null;
  createdAt: string;
}

export interface ApiError {
  error: string;
  code: number;
  details?: unknown;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assignedToId?: string;
  isOverdue?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
