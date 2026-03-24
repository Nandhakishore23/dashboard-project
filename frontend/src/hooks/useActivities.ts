import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../api/endpoints';

export const useActivities = (page = 1, limit = 50) => {
  return useQuery({
    queryKey: ['activities', page, limit],
    queryFn: async () => {
      const response = await activityApi.getAll(page, limit);
      return response.data.activities;
    },
  });
};

export const useProjectActivities = (projectId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['activities', 'project', projectId, page, limit],
    queryFn: async () => {
      const response = await activityApi.getProjectActivities(projectId, page, limit);
      return response.data.activities;
    },
    enabled: !!projectId,
  });
};
