// apps/web/src/hooks/useReports.ts - COMPLETE FIXED VERSION
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI, Report, ApiResponse } from '../lib/api';
import { useState } from 'react';

interface ReportFilters {
  page: number;
  limit: number;
  status: string;
}

export const useReports = () => {
  const [params, setParams] = useState<ReportFilters>({
    page: 1,
    limit: 20,
    status: ''
  });

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ApiResponse<Report[]>>({
    queryKey: ['reports', params],
    queryFn: () => reportsAPI.getAll(params),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ 
      reportId, 
      status, 
      notes 
    }: { 
      reportId: number; 
      status: string; 
      notes?: string 
    }) => reportsAPI.updateStatus(reportId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['reports-stats'],
    queryFn: reportsAPI.getStats,
  });

  return {
    reports: data?.data || [],
    meta: data?.meta,
    stats: statsData?.data,
    isLoading,
    error,
    params,
    setParams,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
  };
};