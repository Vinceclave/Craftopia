// apps/mobile/src/hooks/queries/useReports.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportService, CreateReportPayload, Report } from '~/services/report.service';

export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  myReports: () => [...reportKeys.lists(), 'my'] as const,
  detail: (id: number) => [...reportKeys.all, 'detail', id] as const,
};

/**
 * Submit a report mutation
 */
export const useSubmitReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReportPayload) => {
      const response = await reportService.submitReport(payload);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate my reports list
      queryClient.invalidateQueries({
        queryKey: reportKeys.myReports(),
      });
    },
    onError: (error) => {
      console.error('Failed to submit report:', error);
    },
  });
};

/**
 * Get user's reports
 */
export const useMyReports = () => {
  return useQuery({
    queryKey: reportKeys.myReports(),
    queryFn: async () => {
      const response = await reportService.getMyReports();
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get report by ID
 */
export const useReport = (reportId: number) => {
  return useQuery({
    queryKey: reportKeys.detail(reportId),
    queryFn: async () => {
      const response = await reportService.getReportById(reportId.toString());
      return response.data;
    },
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000,
  });
};