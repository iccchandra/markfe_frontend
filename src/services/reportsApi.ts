// src/services/reportsApi.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Types
export enum ReportType {
  DAILY_BATCH_SUMMARY = 'DAILY_BATCH_SUMMARY',
  WEEKLY_DISBURSEMENT = 'WEEKLY_DISBURSEMENT',
  MONTHLY_RECONCILIATION = 'MONTHLY_RECONCILIATION',
  PENNY_DROP_ANALYSIS = 'PENNY_DROP_ANALYSIS',
  DATA_QUALITY_TRENDS = 'DATA_QUALITY_TRENDS',
  STAGE_PERFORMANCE = 'STAGE_PERFORMANCE',
  PAYMENT_FAILURE_ANALYSIS = 'PAYMENT_FAILURE_ANALYSIS',
  BANK_PERFORMANCE_COMPARISON = 'BANK_PERFORMANCE_COMPARISON',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  EXCEL = 'EXCEL',
  PDF = 'PDF',
  CSV = 'CSV',
  JSON = 'JSON',
}

export enum ReportPeriod {
  TODAY = 'TODAY',
  YESTERDAY = 'YESTERDAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
  THIS_WEEK = 'THIS_WEEK',
  LAST_WEEK = 'LAST_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  LAST_MONTH = 'LAST_MONTH',
  THIS_QUARTER = 'THIS_QUARTER',
  LAST_QUARTER = 'LAST_QUARTER',
  THIS_YEAR = 'THIS_YEAR',
  CUSTOM = 'CUSTOM',
}

export interface GenerateReportRequest {
  reportType: ReportType;
  format: ReportFormat;
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
  batchIds?: string[];
  stages?: string[];
  bankNames?: string[];
  paymentStatus?: string[];
  includeDetails?: boolean;
  includeCharts?: boolean;
}

export interface CustomReportRequest extends GenerateReportRequest {
  reportName: string;
  fields: string[];
  groupBy?: string[];
  sortBy?: { field: string; order: 'ASC' | 'DESC' }[];
  aggregations?: { field: string; function: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' }[];
}

export interface ScheduleReportRequest extends GenerateReportRequest {
  scheduleName: string;
  cronExpression: string;
  recipients: string[];
  emailSubject?: string;
  emailBody?: string;
  isActive?: boolean;
}

export interface ReportMetadata {
  reportId: string;
  reportType: ReportType;
  format: ReportFormat;
  generatedAt: string;
  generatedBy: string;
  period: {
    startDate: string;
    endDate: string;
  };
  recordCount: number;
  filePath?: string;
  fileSize?: number;
}

export interface DailyBatchSummary {
  date: string;
  batchesProcessed: number;
  totalBeneficiaries: number;
  totalAmount: number;
  validationPassRate: number;
  paymentSuccessRate: number;
  criticalIssues: number;
  actionItemsPending: number;
  batches: Array<{
    batchId: string;
    beneficiaryCount: number;
    amount: number;
    status: string;
    stage: string;
  }>;
}

export interface WeeklyDisbursement {
  weekStartDate: string;
  weekEndDate: string;
  totalDisbursed: number;
  byStage: {
    BL: { count: number; amount: number };
    RL: { count: number; amount: number };
    RC: { count: number; amount: number };
    COMPLETED: { count: number; amount: number };
  };
  successRate: {
    overall: number;
    byStage: Record<string, number>;
  };
  weekOverWeekComparison: {
    disbursementChange: number;
    countChange: number;
  };
  cumulativeToDate: number;
}

export interface Schedule {
  id: string;
  scheduleName: string;
  reportType: ReportType;
  format: ReportFormat;
  cronExpression: string;
  recipients: string[];
  isActive: boolean;
  nextRun: string;
  lastRun?: string;
  createdAt: string;
}

export interface ReportHistory {
  id: string;
  reportType: ReportType;
  reportName?: string;
  format: ReportFormat;
  generatedAt: string;
  generatedBy: string;
  fileSize?: number;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
}

// API Client Configuration
class ReportsApiService {
  private api: AxiosInstance;

  constructor(baseURL: string = 'https://kotak-risk-analysis.alliantprojects.com') {
    this.api = axios.create({
      baseURL: `${baseURL}/Allreports`,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================================
  // STANDARD REPORTS
  // ============================================================

  async generateReport(request: GenerateReportRequest): Promise<any> {
    const response = await this.api.post('/generate', request);
    return response.data;
  }

  async getDailyBatchSummary(
    date?: string,
    format: ReportFormat = ReportFormat.JSON
  ): Promise<DailyBatchSummary | Blob> {
    const params = { date, format };
    const config: AxiosRequestConfig = format !== ReportFormat.JSON 
      ? { responseType: 'blob' } 
      : {};
    
    const response = await this.api.get('/daily-batch-summary', { params, ...config });
    return response.data;
  }

  async getWeeklyDisbursement(
    weekStart?: string,
    format: ReportFormat = ReportFormat.JSON
  ): Promise<WeeklyDisbursement | Blob> {
    const params = { weekStart, format };
    const config: AxiosRequestConfig = format !== ReportFormat.JSON 
      ? { responseType: 'blob' } 
      : {};
    
    const response = await this.api.get('/weekly-disbursement', { params, ...config });
    return response.data;
  }

  async getMonthlyReconciliation(
    month?: string,
    year?: string,
    format: ReportFormat = ReportFormat.JSON
  ): Promise<any> {
    const params = { month, year, format };
    const config: AxiosRequestConfig = format !== ReportFormat.JSON 
      ? { responseType: 'blob' } 
      : {};
    
    const response = await this.api.get('/monthly-reconciliation', { params, ...config });
    return response.data;
  }

  async getPennyDropAnalysis(
    startDate?: string,
    endDate?: string,
    format: ReportFormat = ReportFormat.JSON
  ): Promise<any> {
    const params = { startDate, endDate, format };
    const config: AxiosRequestConfig = format !== ReportFormat.JSON 
      ? { responseType: 'blob' } 
      : {};
    
    const response = await this.api.get('/penny-drop-analysis', { params, ...config });
    return response.data;
  }

  async getDataQualityTrends(
    startDate?: string,
    endDate?: string,
    format: ReportFormat = ReportFormat.JSON
  ): Promise<any> {
    const params = { startDate, endDate, format };
    const config: AxiosRequestConfig = format !== ReportFormat.JSON 
      ? { responseType: 'blob' } 
      : {};
    
    const response = await this.api.get('/data-quality-trends', { params, ...config });
    return response.data;
  }

  async getStagePerformance(
    startDate?: string,
    endDate?: string,
    format: ReportFormat = ReportFormat.JSON
  ): Promise<any> {
    const params = { startDate, endDate, format };
    const config: AxiosRequestConfig = format !== ReportFormat.JSON 
      ? { responseType: 'blob' } 
      : {};
    
    const response = await this.api.get('/stage-performance', { params, ...config });
    return response.data;
  }

  async getPaymentFailureAnalysis(
    startDate?: string,
    endDate?: string,
    format: ReportFormat = ReportFormat.JSON
  ): Promise<any> {
    const params = { startDate, endDate, format };
    const config: AxiosRequestConfig = format !== ReportFormat.JSON 
      ? { responseType: 'blob' } 
      : {};
    
    const response = await this.api.get('/payment-failure-analysis', { params, ...config });
    return response.data;
  }

  async getBankPerformanceComparison(
    startDate?: string,
    endDate?: string,
    format: ReportFormat = ReportFormat.JSON
  ): Promise<any> {
    const params = { startDate, endDate, format };
    const config: AxiosRequestConfig = format !== ReportFormat.JSON 
      ? { responseType: 'blob' } 
      : {};
    
    const response = await this.api.get('/bank-performance-comparison', { params, ...config });
    return response.data;
  }

  // ============================================================
  // CUSTOM REPORTS
  // ============================================================

  async generateCustomReport(request: CustomReportRequest): Promise<any> {
    const config: AxiosRequestConfig = request.format !== ReportFormat.JSON 
      ? { responseType: 'blob' } 
      : {};
    
    const response = await this.api.post('/custom', request, config);
    return response.data;
  }

  async saveCustomReportTemplate(request: CustomReportRequest): Promise<any> {
    const response = await this.api.post('/custom/save-template', request);
    return response.data;
  }

  async getCustomReportTemplates(): Promise<any[]> {
    const response = await this.api.get('/custom/templates');
    return response.data;
  }

  async getCustomReportTemplate(id: string): Promise<any> {
    const response = await this.api.get(`/custom/templates/${id}`);
    return response.data;
  }

  async generateFromTemplate(
    id: string,
    params: { startDate?: string; endDate?: string; format?: ReportFormat }
  ): Promise<any> {
    const config: AxiosRequestConfig = params.format !== ReportFormat.JSON 
      ? { responseType: 'blob' } 
      : {};
    
    const response = await this.api.post(`/custom/templates/${id}/generate`, params, config);
    return response.data;
  }

  // ============================================================
  // SCHEDULED REPORTS
  // ============================================================

  async scheduleReport(request: ScheduleReportRequest): Promise<Schedule> {
    const response = await this.api.post('/schedule', request);
    return response.data;
  }

  async getScheduledReports(): Promise<Schedule[]> {
    const response = await this.api.get('/schedules');
    return response.data;
  }

  async getScheduledReport(id: string): Promise<Schedule> {
    const response = await this.api.get(`/schedules/${id}`);
    return response.data;
  }

  async pauseSchedule(id: string): Promise<Schedule> {
    const response = await this.api.post(`/schedules/${id}/pause`);
    return response.data;
  }

  async resumeSchedule(id: string): Promise<Schedule> {
    const response = await this.api.post(`/schedules/${id}/resume`);
    return response.data;
  }

  async deleteSchedule(id: string): Promise<void> {
    await this.api.post(`/schedules/${id}/delete`);
  }

  // ============================================================
  // REPORT HISTORY
  // ============================================================

  async getReportHistory(limit: number = 50, offset: number = 0): Promise<{
    reports: ReportHistory[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const response = await this.api.get('/history', { params: { limit, offset } });
    return response.data;
  }

  async getReportDetails(reportId: string): Promise<ReportHistory> {
    const response = await this.api.get(`/history/${reportId}`);
    return response.data;
  }

  async downloadReport(reportId: string): Promise<Blob> {
    const response = await this.api.get(`/history/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // ============================================================
  // UTILITY
  // ============================================================

  async getAvailableFields(): Promise<any> {
    const response = await this.api.get('/available-fields');
    return response.data;
  }

  async getExportFormats(): Promise<any> {
    const response = await this.api.get('/export-formats');
    return response.data;
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const reportsApi = new ReportsApiService();
export default reportsApi;