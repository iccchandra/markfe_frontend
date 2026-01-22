import axios, { AxiosInstance } from 'axios';

/**
 * API Service for Payment Verification - UPDATED
 * Now includes separate methods for Not Presented and Failed Payments
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://kotak-risk-analysis.alliantprojects.com/api/v1';

class PaymentVerificationService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

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

  // ============================================
  // DASHBOARD & SUMMARY
  // ============================================

  async getDashboard() {
    const response = await this.api.get('/payment-verification/dashboard');
    return response.data;
  }

  async getStageWise() {
    const response = await this.api.get('/payment-verification/stage-wise');
    return response.data;
  }

  // ============================================
  // BENEFICIARY QUERIES
  // ============================================

  async getBeneficiaryStatus(beneficiaryId: string, stage?: string) {
    const params = stage ? { stage } : {};
    const response = await this.api.get(
      `/payment-verification/beneficiary/${beneficiaryId}`,
      { params }
    );
    return response.data;
  }

  // ============================================
  // NEW: SEPARATE ENDPOINTS FOR DIFFERENT ISSUES
  // ============================================

  /**
   * Get records NOT PRESENTED to bank
   * These are approved but no payment record exists
   */
  async getNotPresented(page: number = 1, limit: number = 50) {
    const response = await this.api.get('/payment-verification/not-presented', {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Get records PRESENTED but FAILED
   * These have payment records but responseCode != '00'
   */
  async getPresentedButFailed(page: number = 1, limit: number = 50) {
    const response = await this.api.get('/payment-verification/presented-but-failed', {
      params: { page, limit },
    });
    return response.data;
  }

  // ============================================
  // LEGACY: COMBINED VIEW
  // ============================================

  /**
   * Get all approved but not paid (combined)
   * For backward compatibility
   */
  async getApprovedNotPaid(page: number = 1, limit: number = 50) {
    const response = await this.api.get('/payment-verification/approved-not-paid', {
      params: { page, limit },
    });
    return response.data;
  }

  async getSuccessfulPayments(page: number = 1, limit: number = 50) {
    const response = await this.api.get('/payment-verification/successful-payments', {
      params: { page, limit },
    });
    return response.data;
  }

  // ============================================
  // REPORTS
  // ============================================

  async getResponseCodeDistribution() {
    const response = await this.api.get('/payment-verification/response-code-distribution');
    return response.data;
  }

  // ============================================
  // ACTIONS
  // ============================================

  async linkPaymentRecords() {
    const response = await this.api.post('/payment-verification/link-payment-records');
    return response.data;
  }

  // ============================================
  // MD APPROVALS REPORTING (if needed)
  // ============================================

  async getMdApprovalDashboard() {
    const response = await this.api.get('/reports/md-approvals/dashboard');
    return response.data;
  }

  async getStageWiseReport() {
    const response = await this.api.get('/reports/md-approvals/stage-wise');
    return response.data;
  }

  async getDistrictWiseReport() {
    const response = await this.api.get('/reports/md-approvals/district-wise');
    return response.data;
  }

  async getMandalWiseReport(district: string) {
    const response = await this.api.get(`/reports/md-approvals/mandal-wise/${district}`);
    return response.data;
  }

  async getVillageWiseReport(district: string, mandal: string) {
    const response = await this.api.get(
      `/reports/md-approvals/village-wise/${district}/${mandal}`
    );
    return response.data;
  }

  async searchApprovals(filters: {
    beneficiaryId?: string;
    applicantName?: string;
    district?: string;
    mandal?: string;
    village?: string;
    stage?: string;
    approvalByMD?: boolean;
    bankPaymentStatus?: string;
    reconciliationStatus?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await this.api.get('/reports/md-approvals/search', { params: filters });
    return response.data;
  }

  async getPendingApprovals(page: number = 1, limit: number = 50) {
    const response = await this.api.get('/reports/md-approvals/pending/approvals', {
      params: { page, limit },
    });
    return response.data;
  }

  async getPendingBankPosting(page: number = 1, limit: number = 50) {
    const response = await this.api.get('/reports/md-approvals/pending/bank-posting', {
      params: { page, limit },
    });
    return response.data;
  }

  async getPendingReconciliation(page: number = 1, limit: number = 50) {
    const response = await this.api.get('/reports/md-approvals/pending/reconciliation', {
      params: { page, limit },
    });
    return response.data;
  }
}

export default new PaymentVerificationService();