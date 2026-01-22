// src/services/failureReportApi.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://kotak-risk-analysis.alliantprojects.com';

export interface FailureStageBreakdown {
  stage: string;
  failedCount: number;
  failedAmount: number;
  uniqueBeneficiaries: number;
}

export interface TopAffectedBank {
  bankIIN: string;
  bankName: string;
  failureCount: number;
}

export interface FailureReportItem {
  responseCode: string;
  reasonDescription: string;
  actionToBeTaken: string;
  category: string;
  totalFailures: number;
  uniqueBeneficiaries: number;
  totalAmount: number;
  failurePercentage: number;
  retriedBeneficiaries: number;
  succeededAfterRetry: number;
  stillFailing: number;
  retrySuccessRate: number;
  stageBreakdown: FailureStageBreakdown[];
  topAffectedBanks: TopAffectedBank[];
}

export interface FailureReportResponse {
  data: FailureReportItem[];
  summary: {
    totalFailures: number;
    uniqueFailureReasons: number;
    uniqueBeneficiariesAffected: number;
    totalFailedAmount: number;
    totalRetried: number;
    totalSucceededAfterRetry: number;
    totalStillFailing: number;
    overallRetrySuccessRate: number;
    mostCommonFailure: {
      code: string;
      description: string;
      count: number;
    } | null;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      percentage: number;
    }>;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface FailureReportParams {
  startDate?: string;
  endDate?: string;
  days?: number;
  stage?: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  responseCode?: string;
  category?: 'SUCCESS' | 'BANK_RETURN' | 'NPCI_REJECTION' | 'MANDATE' | 'OTHER';
}

class FailureReportApi {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

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

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async getFailureReport(params?: FailureReportParams): Promise<FailureReportResponse> {
    const response = await this.axiosInstance.get<FailureReportResponse>(
      '/failurereports/failure',
      { params }
    );
    return response.data;
  }

  async exportFailureReport(params?: FailureReportParams): Promise<Blob> {
    const response = await this.axiosInstance.get('/failurereports/failure/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}

export const failureReportApi = new FailureReportApi();