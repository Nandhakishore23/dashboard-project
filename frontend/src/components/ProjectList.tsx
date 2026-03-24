import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { usePermission } from './RequireRole';
import { ProjectForm, DeleteProjectModal } from './ProjectForm';
import { Project } from '../types';

export const ProjectList: React.FC = () => {
  const { data: projects, isLoading } = useProjects();
  const { canCreateProject, canEditProject } = usePermission();
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Projects</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Manage and collaborate on your team's top-level initiatives</p>
        </div>
        {canCreateProject && (
          <button
            onClick={() => {
              setEditingProject(null);
              setShowProjectForm(true);
            }}
            className="btn btn-primary"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-semibold tracking-wide">New Project</span>
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-slideIn">
        {projects?.map((project) => (
          <div key={project.id} className="card p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner ring-4 ring-indigo-50 group-hover:ring-indigo-100 transition-all">
                <span className="text-white font-extrabold text-xl">{project.name.charAt(0).toUpperCase()}</span>
              </div>
              {canEditProject && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingProject(project);
                      setShowProjectForm(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeletingProject(project)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">{project.name}</h3>
            <p className="text-sm text-slate-500 mb-5 line-clamp-2 leading-relaxed h-10">
              {project.description || <span className="italic text-slate-400">No description provided</span>}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase border border-white shadow-sm">
                  {project.owner?.name.charAt(0) || '?'}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Owner</span>
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[80px]">{project.owner?.name || 'Unknown'}</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tasks</span>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5">{project._count?.tasks || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(!projects || projects.length === 0) && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-6">Create your first project to get started</p>
          {canCreateProject && (
            <button
              onClick={() => {
                setEditingProject(null);
                setShowProjectForm(true);
              }}
              className="btn btn-primary"
            >
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <ProjectForm
        isOpen={showProjectForm}
        onClose={() => {
          setShowProjectForm(false);
          setEditingProject(null);
        }}
        project={editingProject}
      />
      <DeleteProjectModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        project={deletingProject}
      />
    </div>
  );
};
