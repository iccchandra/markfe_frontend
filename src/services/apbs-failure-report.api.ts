// src/services/api/apbs-failure-report.api.ts

import axios, { AxiosInstance } from 'axios';

export interface ApbsFailureReportQuery {
  startDate?: string;
  endDate?: string;
  stage?: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  page?: number;
  limit?: number;
}

export interface DailyFailureSummary {
  date: string;
  stage: string;
  failedBeneficiaries: number;
  totalFailedAttempts: number;
  previousDayFailures: number | null;
  changeFromPreviousDay: number | null;
}

export interface ReattemptAnalysis {
  date: string;
  stage: string;
  totalFailed: number;
  reattemptedCount: number;
  reattemptedNextDay: number;
  reattemptRate: number;
}

export interface ResolutionTracking {
  date: string;
  stage: string;
  totalFailed: number;
  resolvedSuccessfully: number;
  resolvedNextDay: number;
  stillPending: number;
  resolutionRate: number;
}

export interface FailureReasonSummary {
  responseCode: string;
  rejectionReason: string;
  count: number;
  percentage: number;
}

export interface FailedBeneficiaryDetail {
  beneficiaryId: string;
  name: string;
  stage: string;
  failureDate: string;
  responseCode: string;
  rejectionReason: string;
  attemptCount: number;
  lastAttemptDate: string;
  wasResolved: boolean;
  resolutionDate: string | null;
}

export interface CumulativeFailureTracking {
  date: string;
  stage: string;
  newFailures: number;
  retriedFromPrevious: number;
  successfulRetries: number;
  stillFailedRetries: number;
  netChange: number;
  cumulativeFailures: number;
}

export interface ApbsFailureReportResponse {
  dailySummary: DailyFailureSummary[];
  reattemptAnalysis: ReattemptAnalysis[];
  resolutionTracking: ResolutionTracking[];
  topFailureReasons: FailureReasonSummary[];
  cumulativeTracking: CumulativeFailureTracking[]; // ✅ Add this
  summary: {
    totalPeriodFailures: number | string;
    totalUniqueBeneficiaries: number | string;
    overallReattemptRate: number | string;
    overallResolutionRate: number | string;
    averageDaysToResolution: number | string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FailedBeneficiariesListResponse {
  beneficiaries: FailedBeneficiaryDetail[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApbsFailureReportApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: "https://kotak-risk-analysis.alliantprojects.com/",
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getFailureReport(
    params: ApbsFailureReportQuery
  ): Promise<ApbsFailureReportResponse> {
    const response = await this.api.get<ApbsFailureReportResponse>(
      '/reports/apbs-failures',
      { params }
    );
    return response.data;
  }

  async getFailedBeneficiaries(
    params: ApbsFailureReportQuery
  ): Promise<FailedBeneficiariesListResponse> {
    const response = await this.api.get<FailedBeneficiariesListResponse>(
      '/reports/apbs-failures/beneficiaries',
      { params }
    );
    return response.data;
  }

  async exportReport(params: ApbsFailureReportQuery): Promise<Blob> {
    const response = await this.api.get('/reports/apbs-failures/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  }
}

export const apbsFailureReportApi = new ApbsFailureReportApiService();