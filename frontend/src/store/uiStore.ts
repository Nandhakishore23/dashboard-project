import { create } from 'zustand';
import { TaskFilters, TaskStatus, TaskPriority } from '../types';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  filters: TaskFilters;
  setFilters: (filters: TaskFilters) => void;
  updateFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  selectedProjectId: null,
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  filters: {},
  setFilters: (filters) => set({ filters }),
  updateFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  clearFilters: () => set({ filters: {} }),
}));

export const useTaskFiltersFromURL = () => {
  const { search } = window.location;
  const params = new URLSearchParams(search);
  
  const filters: TaskFilters = {};
  
  const status = params.get('status');
  if (status && ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].includes(status)) {
    filters.status = status as TaskStatus;
  }
  
  const priority = params.get('priority');
  if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
    filters.priority = priority as TaskPriority;
  }
  
  const projectId = params.get('projectId');
  if (projectId) filters.projectId = projectId;
  
  const isOverdue = params.get('isOverdue');
  if (isOverdue === 'true') filters.isOverdue = true;
  
  const dueDateFrom = params.get('dueDateFrom');
  if (dueDateFrom) filters.dueDateFrom = dueDateFrom;
  
  const dueDateTo = params.get('dueDateTo');
  if (dueDateTo) filters.dueDateTo = dueDateTo;
  
  return filters;
};
