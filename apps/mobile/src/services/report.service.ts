// apps/mobile/src/services/report.service.ts
import { apiService } from './base.service';
import { API_ENDPOINTS, ApiResponse } from '~/config/api';

export type ReportType = 'post' | 'comment' | 'user';

export type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'misinformation'
  | 'violence'
  | 'copyright'
  | 'other';

export interface CreateReportPayload {
  type: ReportType;
  targetId: number;
  reason: ReportReason;
  details?: string;
}

export interface Report {
  report_id: number;
  reporter_id: number;
  type: ReportType;
  target_id: number;
  reason: ReportReason;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

class ReportService {
  /**
   * Submit a report
   */
  async submitReport(payload: CreateReportPayload): Promise<ApiResponse<Report>> {
    try {
      console.log('📝 Submitting report:', payload);
      
      const response = await apiService.post<ApiResponse<Report>>(
        '/api/v1/reports',
        payload
      );
      
      console.log('✅ Report submitted successfully');
      return response;
    } catch (error) {
      console.error('Failed to submit report:', error);
      throw error;
    }
  }

  /**
   * Get user's reports
   */
  async getMyReports(): Promise<ApiResponse<Report[]>> {
    try {
      return await apiService.get<ApiResponse<Report[]>>('/api/v1/reports/my-reports');
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw error;
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(reportId: string): Promise<ApiResponse<Report>> {
    try {
      return await apiService.get<ApiResponse<Report>>(`/api/v1/reports/${reportId}`);
    } catch (error) {
      console.error(`Failed to fetch report ${reportId}:`, error);
      throw error;
    }
  }
}

export const reportService = new ReportService();