import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePermission } from './RequireRole';
import { useUIStore } from '../store/uiStore';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/tasks', label: 'Tasks', icon: '✅' },
  { path: '/projects', label: 'Projects', icon: '📁', requires: ['ADMIN', 'PM'] },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { isAdmin, isPM } = usePermission();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const filteredNavItems = navItems.filter((item) => {
    if (!item.requires) return true;
    if (item.requires.includes('ADMIN') && isAdmin) return true;
    if (item.requires.includes('PM') && (isPM || isAdmin)) return true;
    return false;
  });

  if (!sidebarOpen) {
    return (
      <aside className="w-20 bg-slate-900/95 backdrop-blur-xl text-white flex flex-col border-r border-slate-700/50 shadow-2xl transition-all duration-300">
        <button
          onClick={toggleSidebar}
          className="p-4 m-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
        >
          <span className="text-xl flex justify-center">☰</span>
        </button>
        <nav className="flex-1 flex flex-col gap-2 p-2 mt-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-4 flex justify-center text-center rounded-xl transition-all duration-200 group relative ${
                location.pathname === item.path 
                ? 'bg-indigo-500/20 text-indigo-400 shadow-[inset_0_0_12px_rgba(99,102,241,0.2)]'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
            </Link>
          ))}
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-72 bg-slate-900/95 backdrop-blur-xl text-white flex flex-col border-r border-slate-700/50 shadow-2xl transition-all duration-300">
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">NexusBoard</h1>
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
        >
          <span>☰</span>
        </button>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-2 mt-2">
        {filteredNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              location.pathname === item.path 
              ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-300 shadow-[inset_4px_0_0_0_#818cf8]' 
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`text-xl transition-transform ${location.pathname === item.path ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`}>{item.icon}</span>
            <span className="font-medium tracking-wide">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800/60 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-shadow-sm shadow-inner shadow-white/20">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-indigo-400 tracking-wider font-medium">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
