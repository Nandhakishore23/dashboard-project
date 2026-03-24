import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBadge } from './NotificationBadge';
import { usePermission } from './RequireRole';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isAdmin, canCreateProject } = usePermission();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    PM: 'bg-blue-100 text-blue-800',
    DEVELOPER: 'bg-green-100 text-green-800',
  };

  return (
    <header className="bg-white border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">Project Dashboard</h1>
        </div>

        <div className="flex items-center gap-4">
          {canCreateProject && (
            <button
              onClick={() => navigate('/projects/new')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              New Project
            </button>
          )}

          <NotificationBadge />

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded ${roleColors[user?.role || '']}`}>
                  {user?.role}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                <div className="p-2">
                  <p className="px-3 py-2 text-sm text-gray-500">{user?.email}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};
