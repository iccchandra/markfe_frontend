// src/services/bankReportApi.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://kotak-risk-analysis.alliantprojects.com';

export interface BankStageBreakdown {
  stage: string;
  totalTransactions: number;
  successCount: number;
  failedCount: number;
  totalAmount: number;
  successAmount: number;
  successRate: number;
}

export interface BankReportItem {
  bankIIN: string;
  bankName: string;
  totalBeneficiaries: number;
  totalTransactions: number;
  successCount: number;
  failedCount: number;
  totalAmount: number;
  successAmount: number;
  failedAmount: number;
  successRate: number;
  failureRate: number;
  stageBreakdown: BankStageBreakdown[];
}

export interface BankReportResponse {
  data: BankReportItem[];
  summary: {
    totalBanks: number;
    totalBeneficiaries: number;
    totalTransactions: number;
    totalSuccess: number;
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

export interface BankReportParams {
  startDate?: string;
  endDate?: string;
  days?: number;
  stage?: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  bankIIN?: string;
}

class BankReportApi {
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

  async getBankReport(params?: BankReportParams): Promise<BankReportResponse> {
    const response = await this.axiosInstance.get<BankReportResponse>(
      '/bankreports/bank',
      { params }
    );
    return response.data;
  }

  async exportBankReport(params?: BankReportParams): Promise<Blob> {
    const response = await this.axiosInstance.get('/bankreports/bank/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
}

export const bankReportApi = new BankReportApi();