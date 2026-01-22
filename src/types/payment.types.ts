/**
 * TypeScript Types and Interfaces
 * For Payment Verification System - COMPLETE VERSION
 */

// ============================================
// ENUMS
// ============================================

export enum PaymentStage {
  PENNY_DROP = 'PENNY_DROP',
  BL = 'BL',
  RL = 'RL',
  RC = 'RC',
  COMPLETED = 'COMPLETED',
}

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export enum ReconciliationStatus {
  MATCHED = 'MATCHED',
  MISMATCHED = 'MISMATCHED',
  PENDING = 'PENDING',
}

export enum OverallStatus {
  NOT_APPROVED = 'NOT_APPROVED',
  APPROVED_NOT_PAID = 'APPROVED_NOT_PAID',
  APPROVED_AND_PAID = 'APPROVED_AND_PAID',
  APPROVED_BUT_FAILED = 'APPROVED_BUT_FAILED',
  NOT_PRESENTED = 'NOT_PRESENTED',
  PRESENTED_BUT_FAILED = 'PRESENTED_BUT_FAILED',
}

// ============================================
// DASHBOARD STATISTICS
// ============================================

export interface DashboardStats {
  totalApprovals: number;
  approved: number;
  hasPaymentRecord: number;
  paymentSuccessful: number;
  approvedNotPaid: number;  // Legacy: combined total (for backward compatibility)
  notPresented: number;  // NEW: Not sent to bank
  presentedButFailed: number;  // NEW: Sent but failed
  totalApprovedAmount: number;
  totalPaidAmount: number;
  totalApprovedAmountFormatted: string;
  totalPaidAmountFormatted: string;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
}

// ============================================
// STAGE-WISE STATISTICS
// ============================================

export interface StageStats {
  stage: PaymentStage;
  totalApprovals: number;
  approved: number;
  hasPaymentRecord: number;
  paymentSuccessful: number;
  notPresented: number;
  presentedButFailed: number;
  approvedNotPaid: number;  // Legacy: combined
  successRate: number;
}

export interface StageWiseResponse {
  success: boolean;
  total: number;
  stages: StageStats[];
}

// ============================================
// PAYMENT STATUS
// ============================================

export interface PaymentStatusDetail {
  approvalId: string;
  beneficiaryId: string;
  applicantName: string;
  district: string;
  mandal: string;
  village: string;
  stage: PaymentStage;
  approvedAmount: number;
  approvalByMD: boolean;
  dateOfApproval: string;
  approvedBy: string;
  approvalRemarks: string;
  paymentRecordId: string | null;
  responseCode: string | null;
  actualBankStatus: PaymentStatus;
  uploadedAmount: number;
  paidAmount: number;
  rejectionReason: string | null;
  paymentActuallyDone: boolean;
  overallStatus: OverallStatus;
  uploadDate: string | null;
  bankProcessedDate: string | null;
}

export interface BeneficiaryStatusResponse {
  success: boolean;
  beneficiaryId: string;
  total: number;
  payments: PaymentStatusDetail[];
}

// ============================================
// PAGINATION
// ============================================

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// APPROVED NOT PAID / NOT PRESENTED
// ============================================

export interface ApprovedNotPaidItem {
  beneficiaryId: string;
  applicantName: string;
  district: string;
  mandal: string;
  village: string;
  stage: PaymentStage;
  approvedAmount: number;
  dateOfApproval: string;
  approvedBy?: string;
  responseCode: string | null;
  rejectionReason: string | null;
  daysSinceApproval: number;
  issue: string;
  issueType?: 'NOT_PRESENTED' | 'PRESENTED_BUT_FAILED';
  uploadDate?: string;
  bankProcessedDate?: string;
  npciResponseFlag?: string;
  bankPaymentStatus?: string;
  payment_with?: string;
  bank_name?: string;
}

export interface ApprovedNotPaidResponse {
  success: boolean;
  pagination: Pagination;
  items: ApprovedNotPaidItem[];
}

// ============================================
// SUCCESSFUL PAYMENTS
// ============================================

export interface SuccessfulPayment {
  beneficiaryId: string;
  applicantName: string;
  district: string;
  mandal: string;
  village: string;
  stage: PaymentStage;
  approvedAmount: number;
  paidAmount: number;
  dateOfApproval: string;
  uploadDate: string;
  bankProcessedDate: string;
  responseCode: string;
  payment_with: string;
}

export interface SuccessfulPaymentsResponse {
  success: boolean;
  pagination: Pagination;
  payments: SuccessfulPayment[];
}

// ============================================
// RESPONSE CODE DISTRIBUTION
// ============================================

export interface ResponseCodeDistribution {
  responseCode: string;
  count: number;
  totalAmount: number;
  totalAmountFormatted: string;
  status: string;
}

export interface ResponseCodeDistributionResponse {
  success: boolean;
  total: number;
  distribution: ResponseCodeDistribution[];
}

// ============================================
// DISTRICT WISE REPORT
// ============================================

export interface DistrictStats {
  district: string;
  totalCount: number;
  uniqueBeneficiaries: number;
  approvedCount: number;
  successCount: number;
  totalAmount: number;
  totalAmountFormatted: string;
}

export interface DistrictWiseResponse {
  success: boolean;
  total: number;
  districts: DistrictStats[];
}

// ============================================
// SEARCH FILTERS
// ============================================

export interface SearchFilters {
  beneficiaryId?: string;
  applicantName?: string;
  district?: string;
  mandal?: string;
  village?: string;
  stage?: PaymentStage;
  approvalByMD?: boolean;
  bankPaymentStatus?: PaymentStatus;
  reconciliationStatus?: ReconciliationStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============================================
// SEARCH RESULTS
// ============================================

export interface ApprovalRecord {
  id: string;
  beneficiaryId: string;
  applicantName: string;
  district: string;
  mandal: string;
  village: string;
  stage: PaymentStage;
  amount: number;
  amountInRupees: number;
  approvalByMD: boolean;
  dateOfApproval: string;
  approvedBy: string;
  postedToBank: boolean;
  bankResponseReceived: boolean;
  responseCode: string;
  bankPaymentStatus: PaymentStatus;
  reconciliationDone: boolean;
  reconciliationStatus: ReconciliationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResponse {
  success: boolean;
  filters: SearchFilters;
  pagination: Pagination;
  results: ApprovalRecord[];
}

// ============================================
// LINK PAYMENT RECORDS RESPONSE
// ============================================

export interface LinkPaymentRecordsResponse {
  success: boolean;
  message: string;
  stats: {
    totalApproved: number;
    linked: number;
    notLinked: number;
  };
}

// ============================================
// ERROR RESPONSE
// ============================================

export interface ErrorResponse {
  success: false;
  error: string;
  message?: string;
}

// ============================================
// CHART DATA
// ============================================

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface StageChartData {
  stage: string;
  approved: number;
  paid: number;
  failed: number;
}