// services/payRecordsApi.service.ts

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_CONFIG = {
  baseURL: 'https://kotak-risk-analysis.alliantprojects.com/',
  timeout: 30000,
};


export interface PaymentKPIs {
  overview: {
    total_beneficiaries: number;
    beneficiaries_with_success: number;
    beneficiaries_with_failures: number;
    beneficiaries_with_pending: number;
    success_rate_percentage: number;
    failure_rate_percentage: number;
  };
  payment_method: {
    beneficiaries_paid_via_apbs: number;
    beneficiaries_paid_via_bank: number;
  };
  stages: {
    beneficiaries_bl_stage: number;
    beneficiaries_rl_stage: number;
    beneficiaries_rc_stage: number;
    beneficiaries_completed: number;
    beneficiaries_with_multiple_stages: number;
  };
  amounts: {
    total_success_amount_rupees: number;
    total_failed_amount_rupees: number;
    avg_success_amount_rupees: number;
    amount_ranges: Record<string, number>;
  };
  penny_drop: {
    beneficiaries_pennydrop_success: number;
    beneficiaries_pennydrop_failed: number;
    beneficiaries_pennydrop_notdone: number;
  };
}

export interface BeneficiaryAggregate {
  beneficiaryId: string;
  name: string;
  payment_methods: string[]; // CHANGED: from payment_with to array
  total_transactions: number;
  success_count: number;
  failure_count: number;
  pending_count: number;
  success_amount_rupees: number;
  failed_amount_rupees: number;
  pending_amount_rupees: number;
  total_amount_rupees: number;
  stages: string[];
  first_payment_date: string;
  last_payment_date: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AggregateSummaryResponse {
  summary: {
    total_beneficiaries: number;
    total_transactions: number;
    total_success_count: number;
    total_failure_count: number;
    total_pending_count: number;
    total_success_amount_rupees: number;
    total_failed_amount_rupees: number;
    total_pending_amount_rupees: number;
    grand_total_rupees: number;
  };
  beneficiaries: BeneficiaryAggregate[];
  pagination: Pagination; // ADDED: Pagination support
}

// Types
export interface PayRecord {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  stage: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  bankPaymentStatus: 'SUCCESS' | 'FAILED' | 'PENDING';
  pennyDropStatus: 'SUCCESS' | 'FAILED' | 'NOT_DONE';
  payment_with: 'APBS' | 'BANK' | 'IOB'; // ADDED: IOB
  bankPaidAmount: number;
  bankPaidAmountRupees: number;
  uploadedAmount: number;
  uploadedAmountRupees: number;
  bankProcessedDate: string;
  uploadDate: string;
  responseCode: string;
  bank_name: string;
  narration: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterParams {
  beneficiaryId?: string;
  name?: string;
  aadhaarNumber?: string;
  stage?: string;
  stages?: string[];
  bankPaymentStatus?: string;
  pennyDropStatus?: string;
  payment_with?: string;
  responseCode?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  dateField?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Summary {
  total_records: number;
  unique_beneficiaries: number;
  total_success_amount_rupees: number;
  total_failed_amount_rupees: number;
  total_pending_amount_rupees: number;
  success_count: number;
  failure_count: number;
  pending_count: number;
}

export interface BeneficiaryAboveThreshold {
  beneficiaryId: string;
  name: string;
  payment_count: number;
  success_count: number;
  failure_count: number;
  pending_count: number;
  success_paid_rupees: number;
  failed_paid_rupees: number;
  pending_paid_rupees: number;
}

export interface PennyDropStatusBreakdown {
  pennyDropStatus: string;
  payment_with: string;
  unique_beneficiaries: number;
  total_records: number;
}

export interface StageCombination {
  stages_paid: string;
  beneficiary_count: number;
  total_amount_rupees: number;
}

class PayRecordsApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
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

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const message = (error.response.data as any)?.message || 'An error occurred';
      return new Error(message);
    }
    if (error.request) {
      return new Error('No response from server');
    }
    return new Error(error.message || 'An error occurred');
  }

  private buildQueryString(params: FilterParams): string {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            queryParams.append(key, value.join(','));
          }
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });

    return queryParams.toString();
  }

  async getPaymentKPIs(filters?: FilterParams): Promise<PaymentKPIs> {
    const queryString = filters ? this.buildQueryString(filters) : '';
    const response = await this.api.get(
      `/payreports/pay-records/kpis${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  }

  // Main endpoints
  async getRecords(filters: FilterParams): Promise<ApiResponse<PayRecord[]>> {
    const queryString = this.buildQueryString(filters);
    const response = await this.api.get(`/payreports/pay-records?${queryString}`);
    return response.data;
  }

  async getSummary(filters?: FilterParams): Promise<Summary> {
    const queryString = filters ? this.buildQueryString(filters) : '';
    const response = await this.api.get(
      `/payreports/pay-records/summary${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  }

  async getBeneficiariesAboveThreshold(threshold: number = 20000000): Promise<BeneficiaryAboveThreshold[]> {
    const response = await this.api.get(
      `/payreports/pay-records/above-threshold?threshold=${threshold}`
    );
    return response.data;
  }

  async getPennyDropStatusBreakdown(): Promise<PennyDropStatusBreakdown[]> {
    const response = await this.api.get('/payreports/pay-records/penny-drop-status');
    return response.data;
  }

  async getStageCombinations(): Promise<StageCombination[]> {
    const response = await this.api.get('/payreports/pay-records/stages-combination');
    return response.data;
  }

  async getOnlyRCPaidBeneficiaries(): Promise<any[]> {
    const response = await this.api.get('/payreports/pay-records/only-rc-paid');
    return response.data;
  }

  async getBeneficiaryRecords(beneficiaryId: string): Promise<PayRecord[]> {
    const response = await this.api.get(`/payreports/pay-records/beneficiary/${beneficiaryId}`);
    return response.data;
  }

  async exportToCSV(filters: FilterParams): Promise<Blob> {
    const queryString = this.buildQueryString(filters);
    const response = await this.api.get(
      `/payreports/pay-records/export?${queryString}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  async getAggregateSummary(filters: FilterParams): Promise<AggregateSummaryResponse> {
    const queryString = this.buildQueryString(filters);
    const response = await this.api.get(
      `/payreports/pay-records/aggregate-summary?${queryString}`
    );
    return response.data;
  }
}

// Export singleton instance
export const payRecordsApi = new PayRecordsApiService();
export default payRecordsApi;