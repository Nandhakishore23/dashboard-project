import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface RequireRoleProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  allowedRoles,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export const usePermission = () => {
  const { user } = useAuth();

  return {
    isAdmin: user?.role === 'ADMIN',
    isPM: user?.role === 'PM',
    isDeveloper: user?.role === 'DEVELOPER',
    canCreateProject: user?.role === 'ADMIN' || user?.role === 'PM',
    canEditProject: user?.role === 'ADMIN' || user?.role === 'PM',
    canManageUsers: user?.role === 'ADMIN',
    canAssignTasks: user?.role === 'ADMIN' || user?.role === 'PM',
    canCreateTasks: user?.role === 'ADMIN' || user?.role === 'PM',
  };
};
