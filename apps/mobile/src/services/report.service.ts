// apps/mobile/src/services/report.service.ts - FIXED VERSION
import { apiService } from './base.service';
import { API_ENDPOINTS, ApiResponse } from '~/config/api';

export type ReportType = 'post' | 'comment';

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
  reported_post_id?: number;
  reported_comment_id?: number;
  reason: string;
  status: 'pending' | 'in_review' | 'resolved';
  moderator_notes?: string;
  resolved_by_admin_id?: number;
  created_at: string;
  resolved_at?: string;
}

class ReportService {
  /**
   * Submit a report - matches backend schema
   */
  async submitReport(payload: CreateReportPayload): Promise<ApiResponse<Report>> {
    try {
      
      // Transform payload to match backend schema
      const backendPayload: any = {
        reason: this.formatReasonForBackend(payload.reason, payload.details),
      };

      // Add the appropriate ID field based on type
      if (payload.type === 'post') {
        backendPayload.reported_post_id = payload.targetId;
      } else if (payload.type === 'comment') {
        backendPayload.reported_comment_id = payload.targetId;
      }

      const response = await apiService.post<ApiResponse<Report>>(
        API_ENDPOINTS.REPORTS.CREATE,
        backendPayload
      );
      
      return response;
    } catch (error: any) {
      console.error('❌ Failed to submit report:', error);
      
      // Enhance error message
      if (error.message?.includes('already reported')) {
        throw new Error('You have already reported this content.');
      }
      
      throw new Error(error.message || 'Failed to submit report. Please try again.');
    }
  }

  /**
   * Format reason for backend (combines reason type with details)
   */
  private formatReasonForBackend(reason: ReportReason, details?: string): string {
    const reasonLabels: Record<ReportReason, string> = {
      spam: 'Spam',
      harassment: 'Harassment or Bullying',
      inappropriate: 'Inappropriate Content',
      misinformation: 'False Information',
      violence: 'Violence or Dangerous Content',
      copyright: 'Copyright Violation',
      other: 'Other',
    };

    const baseReason = reasonLabels[reason] || 'Other';
    
    if (details && details.trim()) {
      return `${baseReason}: ${details.trim()}`;
    }
    
    return baseReason;
  }

  /**
   * Get user's reports
   */
  async getMyReports(): Promise<ApiResponse<Report[]>> {
    try {
      return await apiService.get<ApiResponse<Report[]>>(API_ENDPOINTS.REPORTS.MY_REPORTS);
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