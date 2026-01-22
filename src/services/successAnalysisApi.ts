// src/services/successAnalysisApi.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://kotak-risk-analysis.alliantprojects.com';

export enum AmountRange {
  BELOW_1_LAKH = 'BELOW_1_LAKH',
  BETWEEN_1_2_LAKH = 'BETWEEN_1_2_LAKH',
  BETWEEN_2_3_LAKH = 'BETWEEN_2_3_LAKH',
  BETWEEN_3_4_LAKH = 'BETWEEN_3_4_LAKH',
  BETWEEN_4_5_LAKH = 'BETWEEN_4_5_LAKH',
  ABOVE_5_LAKH = 'ABOVE_5_LAKH',
  ALL = 'ALL'
}

export enum PaymentStage {
  ALL = 'ALL',
  BL = 'BL',
  RL = 'RL',
  RC = 'RC',
  COMPLETED = 'COMPLETED'
}

export interface SuccessfulBeneficiary {
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  stage: string;
  paidAmount: number;
  bankName: string;
  bankIIN: string;
  paymentDate: string;
  creditReference: string;
  narration: string;
}

export interface StageWiseBreakdown {
  stage: string;
  count: number;
  totalAmount: number;
  percentage: number;
  readyForNext: number;
}

export interface AmountRangeBreakdown {
  range: string;
  rangeLabel: string;
  minAmount: number;
  maxAmount: number | null;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface BankWiseBreakdown {
  bankIIN: string;
  bankName: string;
  beneficiaryCount: number;
  totalAmount: number;
  averageAmount: number;
}

export interface SuccessAnalysisResponse {
  data: SuccessfulBeneficiary[];
  summary: {
    totalBeneficiaries: number;
    totalAmount: number;
    averageAmount: number;
    medianAmount: number;
    highestPayment: number;
    lowestPayment: number;
    stageWiseBreakdown: StageWiseBreakdown[];
    amountRangeBreakdown: AmountRangeBreakdown[];
    bankWiseBreakdown: BankWiseBreakdown[];
  };
  filters: {
    amountRange: string;
    stage: string;
  };
}

export interface SuccessAnalysisParams {
  amountRange?: AmountRange;
  stage?: PaymentStage;
}

class SuccessAnalysisApi {
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

  async getSuccessAnalysis(params?: SuccessAnalysisParams): Promise<SuccessAnalysisResponse> {
    const response = await this.axiosInstance.get<SuccessAnalysisResponse>(
      '/reports/success-analysis',
      { params }
    );
    return response.data;
  }
}

export const successAnalysisApi = new SuccessAnalysisApi();