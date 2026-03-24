export enum Role {
  ADMIN = 'ADMIN',
  PM = 'PM',
  DEVELOPER = 'DEVELOPER',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload;
}

export interface ApiError {
  error: string;
  code: number;
  details?: unknown;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  details: string | null;
  userId: string;
  userName: string;
  projectId: string | null;
  taskId: string | null;
  createdAt: Date;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  projectId?: string;
  assignedToId?: string;
  isOverdue?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
}
