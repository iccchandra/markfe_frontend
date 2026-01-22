// ============================================================================
// FILE TRACKING SERVICE
// src/services/fileTrackingService.ts
// ============================================================================

import axios, { AxiosInstance } from 'axios';

// Types
export interface DailySummaryItem {
  reportDate: string;
  dayName: string;
  filesSent: number;
  recordsSent: number;
  sentUploadDate: string | null;
  filesReceived: number;
  recordsReceived: number;
  receivedUploadDate: string | null;
  pendingCount: number;
  status: 'NO_REQUEST' | 'AWAITING' | 'COMPLETE' | 'PARTIAL' | 'EXCESS';
  turnaroundDays: number | null;
}

export interface DailySummaryResponse {
  data: DailySummaryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PendingFileItem {
  sentDate: string;
  dayName: string;
  daysWaiting: number;
  pendingFiles: number;
  pendingRecords: number;
  batchDetails: string;
  sentOn: string;
}

export interface PendingFilesResponse {
  data: PendingFileItem[];
  total: number;
}

export interface WeeklySummaryItem {
  weekPeriod: string;
  totalSent: number;
  totalReceived: number;
  weeklyPending: number;
  recordsSent: number;
  recordsReceived: number;
  avgTurnaround: number;
  completionRate: string;
}

export interface WeeklySummaryResponse {
  data: WeeklySummaryItem[];
  total: number;
}

export interface DashboardMetrics {
  totalPendingDates: number;
  avgTurnaroundDays: number;
  filesSentThisMonth: number;
  filesReceivedThisMonth: number;
  completionRate: number;
  filesSentThisWeek: number;
  filesReceivedThisWeek: number;
}

export interface DailySummaryParams {
  startDate?: string;
  endDate?: string;
  status?: 'NO_REQUEST' | 'AWAITING' | 'COMPLETE' | 'PARTIAL' | 'EXCESS';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PendingFilesParams {
  minDaysWaiting?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface WeeklySummaryParams {
  weeks?: number;
}

// API Client
class FileTrackingService {
  private api: AxiosInstance;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.api = axios.create({
      baseURL: `${baseURL}/file-tracking`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor if needed
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get daily summary of sent vs received files
   */
  async getDailySummary(params?: DailySummaryParams): Promise<DailySummaryResponse> {
    const response = await this.api.get<DailySummaryResponse>('/daily-summary', {
      params,
    });
    return response.data;
  }

  /**
   * Get pending files (sent but not received)
   */
  async getPendingFiles(params?: PendingFilesParams): Promise<PendingFilesResponse> {
    const response = await this.api.get<PendingFilesResponse>('/pending-files', {
      params,
    });
    return response.data;
  }

  /**
   * Get weekly summary
   */
  async getWeeklySummary(params?: WeeklySummaryParams): Promise<WeeklySummaryResponse> {
    const response = await this.api.get<WeeklySummaryResponse>('/weekly-summary', {
      params,
    });
    return response.data;
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await this.api.get<DashboardMetrics>('/dashboard-metrics');
    return response.data;
  }

  /**
   * Export data for Excel/CSV
   */
  async exportData(days: number = 60): Promise<any> {
    const response = await this.api.get('/export', {
      params: { days },
    });
    return response.data;
  }
}

// Export singleton instance
export const fileTrackingService = new FileTrackingService();

// Export class for custom instances
export default FileTrackingService;