// src/services/dailyStageReportApi.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://kotak-risk-analysis.alliantprojects.com';

export interface StageMetrics {
  benef: number;
  amount: number;
  attempted?: number;
  success?: number;
  failures?: number;
}

export interface DailyStageReportItem {
  date: string;
  BL: StageMetrics;
  RL: StageMetrics;
  RC: StageMetrics;
  COMPLETED: StageMetrics;
  totals: {
    benefSuccess: number;
    amountSuccess: number;
    attempted: number;
    success: number;
    failures: number;
    failedAmount: number;
    successRate: number;
  };
}

export interface DailyStageReportResponse {
  data: DailyStageReportItem[];
  summary: {
    totalDays: number;
    totalBeneficiaries: number;
    totalAmount: number;
    totalAttempted: number;
    totalSuccess: number;
    totalFailures: number;
    overallSuccessRate: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface DailyStageReportParams {
  startDate?: string;
  endDate?: string;
  days?: number;
}

class DailyStageReportApi {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }


  async getDailyStageReport(
    params?: DailyStageReportParams
  ): Promise<DailyStageReportResponse> {
    const response = await this.axiosInstance.get<DailyStageReportResponse>(
      '/daywisereports/daily-stage',
      { params }
    );
    return response.data;
  }

   /**
   * Download Excel file from backend
   */
   async downloadExcelReport(params?: DailyStageReportParams): Promise<void> {
    try {
      const response = await this.axiosInstance.get(
        '/daywisereports/daily-stage/export/excel',
        {
          params,
          responseType: 'blob' // Important: tell axios to expect binary data
        }
      );

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'Daily-Stage-Report.xlsx';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob from response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      throw new Error('Failed to download Excel report');
    }
  }
}

export const dailyStageReportApi = new DailyStageReportApi();