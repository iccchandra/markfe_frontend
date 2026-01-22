// src/services/api/reconciliation.service.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://kotak-risk-analysis.alliantprojects.com';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export enum ReconciliationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum MatchStatus {
  MATCHED = 'MATCHED',
  MISMATCHED = 'MISMATCHED',
  PENNY_DROP_MISMATCH = 'PENNY_DROP_MISMATCH',
  MISSING_IN_BANK = 'MISSING_IN_BANK',
  MISSING_IN_UPLOAD = 'MISSING_IN_UPLOAD',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export enum PennyDropStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  NOT_DONE = 'NOT_DONE',
}

export interface ReconciliationBatch {
  id: string;
  batchId: string;
  uploadDate: string;
  uploadedBy: string;
  processedDate?: string;
  status: ReconciliationStatus;
  fileName?: string;
  responseType?: 'PENNY_DROP' | 'PAYMENT';
  notes?: string;
  totalUploaded: number;
  withPennyDrop: number;
  withoutPennyDrop: number;
  pennyDropSuccess: number;
  pennyDropFailed: number;
  totalBankRecords: number;
  bankPaymentSuccess: number;
  bankPaymentFailed: number;
  matchedRecords: number;
  mismatchedRecords: number;
  missingInBank: number;
  missingInUpload: number;
  pennyDropMismatch: number;
  matchRate: number;
  totalAmountExpected: number;
  totalAmountPaid: number;
  amountVariance: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationRecord {
  id: string;
  reconciliationId: string;
  batchId: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  wasUploaded: boolean;
  uploadedAmount: number;
  pennyDropStatus: PennyDropStatus;
  pennyDropVerifiedName?: string;
  bankPaymentFound: boolean;
  bankPaymentStatus: PaymentStatus;
  bankPaidAmount: number;
  npciResponseFlag?: string;
  responseCode?: string;
  rejectionReason?: string;
  matchStatus: MatchStatus;
  issues: string[];
  requiresInvestigation: boolean;
  uploadDate: string;
  bankProcessedDate?: string;
  destinationBankIIN?: string;
  bankName?: string;
  accountType?: string;
}

export interface BankWiseSummary {
  bankIIN: string;
  bankName: string;
  totalRecords: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  totalAmount: number;
  totalAmountInRupees: string;
  successRate: string;
}

export interface ReasonCodeSummary {
  code: string;
  description: string;
  count: number;
}

export interface ReconciliationDetail {
  reconciliation: ReconciliationBatch;
  records: ReconciliationRecord[];
  stats: {
    total: number;
    matched: number;
    mismatched: number;
    paymentSuccess: number;
    paymentFailed: number;
    pennyDropSuccess: number;
    pennyDropFailed: number;
    criticalIssues: number;
  };
  bankWiseSummary: BankWiseSummary[];
  reasonCodeSummary: ReasonCodeSummary[];
}

export interface ReconciliationListResponse {
  data: ReconciliationBatch[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ReconciliationFilterDto {
  page?: number;
  limit?: number;
  batchId?: string;
  status?: ReconciliationStatus;
  startDate?: string;
  endDate?: string;
}

export interface CreateReconciliationFromBatchDto {
  batchId: string;
  fileName?: string;
  responseType?: 'PENNY_DROP' | 'PAYMENT';
  uploadedBy: string;
}

export interface BankReturnRecordDto {
  achCode: string;
  beneBankIIN: string;
  aadhaarNumber: string;
  aadhaarName: string;
  dbtCode: string;
  amount: string;
  npciResponseFlag: string;
  responseCode: string;
  accountNumber: string;
  rejectionReason: string;
  beneBankName: string;
}

export interface CreateReconciliationDto {
  batchId: string;
  uploadedBy: string;
  bankRecords: BankReturnRecordDto[];
  fileName?: string;
  notes?: string;
}

// ============================================================================
// API SERVICE CLASS
// ============================================================================

class ReconciliationApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
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
          // Handle unauthorized - redirect to login
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // RECONCILIATION BATCH ENDPOINTS
  // ============================================================================

  /**
   * Get all reconciliation batches with optional filters
   */
  async getReconciliations(
    filters?: ReconciliationFilterDto
  ): Promise<ReconciliationListResponse> {
    const response = await this.api.get<ReconciliationListResponse>(
      '/reconciliation',
      { params: filters }
    );
    return response.data;
  }

  /**
   * Get a single reconciliation batch by ID
   */
  async getReconciliationById(id: string): Promise<ReconciliationBatch> {
    const response = await this.api.get<ReconciliationBatch>(
      `/reconciliation/${id}`
    );
    return response.data;
  }

  /**
   * Get detailed reconciliation with records and summaries
   */
  async getReconciliationDetail(id: string): Promise<ReconciliationDetail> {
    const response = await this.api.get<ReconciliationDetail>(
      `/reconciliation/${id}`
    );
    return response.data;
  }

  /**
   * ✅ NEW: Create reconciliation from a processed batch
   * This is the PRIMARY method for creating reconciliations
   */
  async createReconciliationFromBatch(
    data: CreateReconciliationFromBatchDto
  ): Promise<{
    message: string;
    reconciliation: ReconciliationBatch;
  }> {
    const response = await this.api.post<{
      message: string;
      reconciliation: ReconciliationBatch;
    }>('/reconciliation/create-from-batch', data);
    return response.data;
  }

  /**
   * Legacy: Create reconciliation manually from bank return file
   */
  async createReconciliation(
    data: CreateReconciliationDto
  ): Promise<ReconciliationBatch> {
    const response = await this.api.post<ReconciliationBatch>(
      '/reconciliation',
      data
    );
    return response.data;
  }

  // ============================================================================
  // BANK-WISE & REASON CODE SUMMARIES
  // ============================================================================

  /**
   * Get bank-wise reconciliation summary
   */
  async getBankWiseSummary(id: string): Promise<BankWiseSummary[]> {
    const response = await this.api.get<BankWiseSummary[]>(
      `/reconciliation/${id}/bank-wise`
    );
    return response.data;
  }

  /**
   * Get failure reason code summary
   */
  async getReasonCodeSummary(id: string): Promise<ReasonCodeSummary[]> {
    const response = await this.api.get<ReasonCodeSummary[]>(
      `/reconciliation/${id}/reason-codes`
    );
    return response.data;
  }

  // ============================================================================
  // EXPORT FUNCTIONALITY
  // ============================================================================

  /**
   * Export reconciliation report to Excel
   */
  async exportReconciliation(id: string): Promise<Blob> {
    const response = await this.api.get(`/reconciliation/${id}/export`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Export reconciliation list to CSV/Excel
   */
  async exportReconciliations(filters?: ReconciliationFilterDto): Promise<Blob> {
    const response = await this.api.get('/reconciliation/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Download exported file
   */
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Format amount for display (paise to rupees)
   */
  formatAmount(amountInPaise: number): string {
    return `₹${(amountInPaise / 100).toFixed(2)}`;
  }

  /**
   * Format amount in crores
   */
  formatAmountInCrores(amountInPaise: number): string {
    return `₹${(amountInPaise / 10000000).toFixed(2)}Cr`;
  }

  /**
   * Get status badge configuration
   */
  getStatusConfig(status: ReconciliationStatus) {
    const configs = {
      PENDING: {
        color: 'orange',
        label: 'Pending',
        bgClass: 'bg-orange-100',
        textClass: 'text-orange-800',
        borderClass: 'border-orange-300',
      },
      IN_PROGRESS: {
        color: 'blue',
        label: 'Processing',
        bgClass: 'bg-blue-100',
        textClass: 'text-blue-800',
        borderClass: 'border-blue-300',
      },
      COMPLETED: {
        color: 'green',
        label: 'Completed',
        bgClass: 'bg-green-100',
        textClass: 'text-green-800',
        borderClass: 'border-green-300',
      },
      FAILED: {
        color: 'red',
        label: 'Failed',
        bgClass: 'bg-red-100',
        textClass: 'text-red-800',
        borderClass: 'border-red-300',
      },
    };
    return configs[status];
  }

  /**
   * Get match status color
   */
  getMatchStatusColor(rate: number): string {
    if (rate >= 99) return 'text-green-600';
    if (rate >= 95) return 'text-yellow-600';
    return 'text-red-600';
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const reconciliationApiService = new ReconciliationApiService();
export default reconciliationApiService;