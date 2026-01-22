// src/services/failedTransactionsApi.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://kotak-risk-analysis.alliantprojects.com';

export interface FailedBeneficiary {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  stage: string;
  uploadedAmount: number;
  bankPaidAmount: number;
  responseCode: string;
  rejectionReason: string;
  bankIIN: string;
  bankName: string;
  bankProcessedDate: string;
  uploadDate: string;
  narration: string;
  creditReference: string;
  reasonDescription?: string;
  actionToBeTaken?: string;
  reasonCategory?: string;
  fullBankName?: string;
  bankType?: string;
  dsaBank?: string;
}

export interface FailedTransactionGroup {
  groupKey: string;
  groupName: string;
  count: number;
  totalAmount: number;
  records: FailedBeneficiary[];
  reasonDescription?: string;
  actionToBeTaken?: string;
  bankFullName?: string;
  bankType?: string;
}

export interface FailedTransactionsResponse {
  date: string;
  totalFailed: number;
  totalFailedAmount: number;
  groupBy: string;
  groups?: FailedTransactionGroup[];
  records?: FailedBeneficiary[];
  summary: {
    byReason: Array<{ 
      code: string; 
      description: string; 
      count: number; 
      percentage: number;
    }>;
    byBank: Array<{ 
      iin: string; 
      bankName: string; 
      count: number; 
      percentage: number;
    }>;
    byStage: Array<{ 
      stage: string; 
      count: number; 
      percentage: number;
    }>;
  };
}

export interface FailedTransactionsParams {
  date: string;
  reasonCode?: string;
  bankIIN?: string;
  stage?: string;
  groupBy?: 'none' | 'reason' | 'bank' | 'stage';
}

class FailedTransactionsApi {
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

  async getFailedTransactions(
    params: FailedTransactionsParams
  ): Promise<FailedTransactionsResponse> {
    const response = await this.axiosInstance.get<FailedTransactionsResponse>(
      '/reports/failed-transactions',
      { params }
    );
    return response.data;
  }

  async exportFailedTransactions(
    params: FailedTransactionsParams
  ): Promise<Blob> {
    const response = await this.axiosInstance.get(
      '/reports/failed-transactions/export',
      {
        params,
        responseType: 'blob'
      }
    );
    return response.data;
  }
}

export const failedTransactionsApi = new FailedTransactionsApi();