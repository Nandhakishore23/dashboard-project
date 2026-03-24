import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '../api/endpoints';
import { Task, TaskFilters } from '../types';

export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: async () => {
      const response = await taskApi.getAll(filters);
      return response.data.tasks;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useMyTasks = () => {
  return useQuery({
    queryKey: ['tasks', 'my'],
    queryFn: async () => {
      const response = await taskApi.getMyTasks();
      return response.data.tasks;
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const response = await taskApi.getById(id);
      return response.data.task;
    },
    enabled: !!id,
    staleTime: 30000,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      status?: string;
      priority?: string;
      dueDate?: string;
      projectId: string;
      assignedToId?: string;
    }) => taskApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        status?: string;
        priority?: string;
        dueDate?: string;
        assignedToId?: string;
      };
    }) => taskApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks']);

      // Optimistically update to the new value
      if (previousTasks) {
        queryClient.setQueryData<Task[]>(
          ['tasks'],
          previousTasks.map((task) =>
            task.id === id ? { ...task, ...data, updatedAt: new Date().toISOString() } : task
          )
        );
      }

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure sync
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};
