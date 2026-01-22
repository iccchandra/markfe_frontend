import axios, { AxiosInstance } from 'axios';

// ============================================
// TYPE DEFINITIONS - UPDATED WITH PAYMENT RECORDS
// ============================================

export interface DateWiseFilters {
  startDate?: string;
  endDate?: string;
  stage?: 'PENNY_DROP' | 'BL' | 'RL' | 'RC' | 'COMPLETED';
  district?: string;
}

export interface MdApprovalStats {
  approved: number;
  rejected: number;
  pending: number;
  approvalRate: string;
}

export interface AmountStats {
  total: number;
  totalFormatted: string;
  approved: number;
  approvedFormatted: string;
  rejected: number;
  rejectedFormatted: string;
}

export interface PaymentStatusData {
  count: number;
  amount: number;
  amountFormatted: string;
}

export interface BankPaymentStats {
  success: PaymentStatusData;
  failed: PaymentStatusData;
  notPresented: PaymentStatusData;
  presented: PaymentStatusData;
  successRate: string;
  presentationRate: string;
}

export interface ReconciliationStats {
  reconciled: number;
  matched: number;
  mismatched: number;
  matchRate: string;
}

export interface StageData {
  count: number;
  amount: number;
  amountFormatted: string;
}

export interface StagesBreakdown {
  PENNY_DROP: StageData;
  BL: StageData;
  RL: StageData;
  RC: StageData;
  COMPLETED: StageData;
}

export interface DateWiseData {
  date: string;
  totalRecords: number;
  uniqueBeneficiaries: number;
  mdApproval: MdApprovalStats;
  amounts: AmountStats;
  bankPayment: BankPaymentStats;
  reconciliation: ReconciliationStats;
  stages: StagesBreakdown;
}

export interface SummaryData {
  totalRecords: number;
  uniqueBeneficiaries: number;
  totalApproved: number;
  totalRejected: number;
  totalAmount: number;
  totalAmountFormatted: string;
  totalApprovedAmount: number;
  totalApprovedAmountFormatted: string;
  totalPresentedAmount: number;
  totalPresentedAmountFormatted: string;
  totalPresentedCount: number;
  totalSuccessAmount: number;
  totalSuccessAmountFormatted: string;
  totalSuccessCount: number;
  totalFailedAmount: number;
  totalFailedAmountFormatted: string;
  totalFailedCount: number;
  totalNotPresentedAmount: number;
  totalNotPresentedAmountFormatted: string;
  totalNotPresentedCount: number;
  overallSuccessRate: string;
  overallPresentationRate: string;
  dateRange: {
    start: string;
    end: string;
    days: number;
  };
}

export interface DateWiseAggregatedResponse {
  success: boolean;
  filters: {
    startDate: string;
    endDate: string;
    stage: string;
    district: string;
  };
  summary: SummaryData;
  data: DateWiseData[];
  totalDays: number;
}

// ============================================
// BENEFICIARY DETAILS TYPES - RENAMED TO AVOID CONFLICTS
// ============================================

// Renamed: MdApprovalFailedBeneficiary (was FailedBeneficiary)
export interface MdApprovalFailedBeneficiary {
  beneficiaryId: string;
  applicantName: string;
  aadhaarNumber: string;  // ✅ Added - from pay_records_integrated
  district: string;
  mandal: string;
  village: string;
  stage: string;
  amountInRupees: number;  // ✅ From pay_records_integrated.uploadedAmount / 100
  responseCode: string;
  rejectionReason: string;
  bankName: string;
  bankIIN: string;
  uploadDate: string;
  bankProcessedDate: string;
  dateOfApproval: string;
}

// Renamed: MdApprovalNotPresentedBeneficiary (was NotPresentedBeneficiary)
export interface MdApprovalNotPresentedBeneficiary {
  beneficiaryId: string;
  applicantName: string;
  aadhaarNumber: string;  // ✅ Added - from md_approvals
  district: string;
  mandal: string;
  village: string;
  stage: string;
  amountInRupees: number;  // ✅ From md_approvals.amountInRupees
  daysSinceApproval: number;
  issue: string;
  dateOfApproval: string;
  approvedBy: string;
}

export interface BeneficiaryDetailsFilters {
  date: string;
  stage?: string;
  district?: string;
}

export interface MdApprovalFailedBeneficiariesResponse {
  success: boolean;
  date: string;
  type: 'FAILED';
  items: MdApprovalFailedBeneficiary[];
  totalCount: number;
  filters: {
    date: string;
    stage?: string;
    district?: string;
  };
}

export interface MdApprovalNotPresentedBeneficiariesResponse {
  success: boolean;
  date: string;
  type: 'NOT_PRESENTED';
  items: MdApprovalNotPresentedBeneficiary[];
  totalCount: number;
  filters: {
    date: string;
    stage?: string;
    district?: string;
  };
}

// ============================================
// API SERVICE CLASS
// ============================================
const API_BASE_URL = 'https://kotak-risk-analysis.alliantprojects.com/api/v1/';

class MdApprovalApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
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
          console.error('Unauthorized access');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get date-wise aggregated MD approvals with payment records
   */
  async getDateWiseAggregated(
    filters: DateWiseFilters = {}
  ): Promise<DateWiseAggregatedResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.district) params.append('district', filters.district);

      const response = await this.api.get<DateWiseAggregatedResponse>(
        `/reports/md-approvals/date-wise-aggregated?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching date-wise aggregated data:', error);
      throw error;
    }
  }

  /**
   * Get failed beneficiaries for a specific date
   */
  async getFailedBeneficiaries(
    filters: BeneficiaryDetailsFilters
  ): Promise<MdApprovalFailedBeneficiariesResponse> {
    try {
      const params = new URLSearchParams();
      params.append('date', filters.date);
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.district) params.append('district', filters.district);

      const response = await this.api.get<MdApprovalFailedBeneficiariesResponse>(
        `/reports/md-approvals/failed-beneficiaries?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching failed beneficiaries:', error);
      throw error;
    }
  }

  /**
   * Get not presented beneficiaries for a specific date
   */
  async getNotPresentedBeneficiaries(
    filters: BeneficiaryDetailsFilters
  ): Promise<MdApprovalNotPresentedBeneficiariesResponse> {
    try {
      const params = new URLSearchParams();
      params.append('date', filters.date);
      if (filters.stage) params.append('stage', filters.stage);
      if (filters.district) params.append('district', filters.district);

      const response = await this.api.get<MdApprovalNotPresentedBeneficiariesResponse>(
        `/reports/md-approvals/not-presented-beneficiaries?${params.toString()}`
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching not presented beneficiaries:', error);
      throw error;
    }
  }

  /**
   * Export failed beneficiaries to Excel
   */
  exportFailedBeneficiaries(filters: BeneficiaryDetailsFilters): string {
    const params = new URLSearchParams();
    params.append('date', filters.date);
    params.append('format', 'excel');
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.district) params.append('district', filters.district);

    return `${API_BASE_URL}reports/md-approvals/failed-beneficiaries/export?${params.toString()}`;
  }

  /**
   * Export not presented beneficiaries to Excel
   */
  exportNotPresentedBeneficiaries(filters: BeneficiaryDetailsFilters): string {
    const params = new URLSearchParams();
    params.append('date', filters.date);
    params.append('format', 'excel');
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.district) params.append('district', filters.district);

    return `${API_BASE_URL}reports/md-approvals/not-presented-beneficiaries/export?${params.toString()}`;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await this.api.get('/reports/md-approvals/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get stage-wise report
   */
  async getStageWiseReport() {
    try {
      const response = await this.api.get('/reports/md-approvals/stage-wise');
      return response.data;
    } catch (error) {
      console.error('Error fetching stage-wise report:', error);
      throw error;
    }
  }

  /**
   * Get district-wise report
   */
  async getDistrictWiseReport() {
    try {
      const response = await this.api.get('/reports/md-approvals/district-wise');
      return response.data;
    } catch (error) {
      console.error('Error fetching district-wise report:', error);
      throw error;
    }
  }

  /**
   * Search approvals with filters
   */
  async searchApprovals(filters: any, page: number = 1, limit: number = 50) {
    try {
      const params = new URLSearchParams({
        ...filters,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await this.api.get(
        `/reports/md-approvals/search?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Error searching approvals:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const mdApprovalApi = new MdApprovalApiService();

// Export class for custom instances
export default MdApprovalApiService;