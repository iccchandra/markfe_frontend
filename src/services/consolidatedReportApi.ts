// src/services/consolidatedReportApi.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://kotak-risk-analysis.alliantprojects.com';

export interface ConsolidatedReportItem {
  date: string;
  totalBeneficiaries: number;
  totalAttempted: number;
  totalPaid: number;
  totalFailed: number;
  totalAmount: number;
  successRate: number;
  failureRate: number;
  averageAmount: number;
}

export interface ConsolidatedReportResponse {
  data: ConsolidatedReportItem[];
  summary: {
    totalDays: number;
    totalBeneficiaries: number;
    totalAttempted: number;
    totalPaid: number;
    totalFailed: number;
    totalAmount: number;
    overallSuccessRate: number;
    overallFailureRate: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface ConsolidatedReportParams {
  startDate?: string;
  endDate?: string;
  days?: number;
}

class ConsolidatedReportApi {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
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

    // Response interceptor
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

  async getConsolidatedReport(
    params?: ConsolidatedReportParams
  ): Promise<ConsolidatedReportResponse> {
    const response = await this.axiosInstance.get<ConsolidatedReportResponse>(
      '/reports/consolidated',
      { params }
    );
    return response.data;
  }
}

export const consolidatedReportApi = new ConsolidatedReportApi();