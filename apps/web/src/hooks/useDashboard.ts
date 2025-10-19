import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../lib/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useActivityLogs = (days = 7) => {
  return useQuery({
    queryKey: ['activity-logs', days],
    queryFn: () => dashboardAPI.getActivityLogs(days),
  });
};

export const useTopUsers = (limit = 10) => {
  return useQuery({
    queryKey: ['top-users', limit],
    queryFn: () => dashboardAPI.getTopUsers(limit),
  });
};

export const useRecentActivity = (limit = 20) => {
  return useQuery({
    queryKey: ['recent-activity', limit],
    queryFn: () => dashboardAPI.getRecentActivity(limit),
  });
};

