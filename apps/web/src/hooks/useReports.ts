// ✅ Fully typed and functional version for report listing, mutation, and stats analytics.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsAPI, Report, ApiResponse, PaginatedResponse } from '../lib/api';
import { useState } from 'react';

// Extended Report type to handle API variations
export interface ExtendedReport extends Omit<Report, 'reported_post'> {
  reported_post?: {
    post_id: number;
    title?: string;  // Optional title field that might be included
    content: string;
  };
}

interface ReportFilters {
  page: number;
  limit: number;
  status?: string;
}

interface ReportStats {
  total: number;
  resolved: number;
  pending: number;
  in_review: number;
  flagged?: number;
}

interface ReportMeta {
  total: number;
  page: number;
  lastPage: number;
  limit: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export const useReports = () => {
  const [params, setParams] = useState<ReportFilters>({
    page: 1,
    limit: 20,
    status: undefined,
  });

  const queryClient = useQueryClient();

  /**
   * 🔍 Fetch paginated reports
   */
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['reports', params],
    queryFn: async () => {
      // ✅ Avoid sending empty string as filter
      const cleanedParams = {
        ...params,
        status: params.status || undefined,
      };

      const response: ApiResponse<PaginatedResponse<Report>> =
        await reportsAPI.getAll(cleanedParams);

      // ✅ Guard against unexpected shapes
      const raw = response?.data;
      const paginated =
        raw && 'data' in raw
          ? raw
          : { data: Array.isArray(raw) ? raw : [], meta: {} };

      // Transform reports to ExtendedReport type
      const transformedReports = paginated.data as ExtendedReport[];

      return {
        reports: transformedReports,
        meta: paginated.meta,
      };
    },
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  /**
   * 🧭 Update report status
   */
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      reportId,
      status,
      notes,
    }: {
      reportId: number;
      status: string;
      notes?: string;
    }) => {
      const response: ApiResponse<Report> = await reportsAPI.updateStatus(
        reportId,
        status,
        notes
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['reports-stats'] });
    },
  });

  /**
   * 📊 Fetch overall report statistics
   */
  const { data: statsData } = useQuery({
    queryKey: ['reports-stats'],
    queryFn: async () => {
      const response: ApiResponse<ReportStats> = await reportsAPI.getStats();
      return response.data;
    },
    staleTime: 60_000,
  });

  // ✅ Provide default values with proper types
  const defaultMeta: ReportMeta = {
    total: 0,
    page: 1,
    lastPage: 1,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  };

  const defaultStats: ReportStats = {
    total: 0,
    resolved: 0,
    pending: 0,
    in_review: 0,
    flagged: 0,
  };

  return {
    reports: (data?.reports ?? []) as ExtendedReport[],
    meta: (data?.meta as ReportMeta) ?? defaultMeta,
    stats: statsData ?? defaultStats,
    isLoading,
    error,
    params,
    setParams,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    refetch,
  };
};