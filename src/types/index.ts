// ============================================
// types/index.ts
// ============================================
export enum UserRole {
  ADMIN = 'admin',
  FINANCE_MANAGER = 'finance_manager',
  OFFICER = 'officer',
  VIEWER = 'viewer',
  EDITOR = "EDITOR"
}

export enum BeneficiaryStage {
  BL = 'BL',           // Beneficiary List Stage - Data validated, payment made
  RL = 'RL',           // Release List Stage - Released to bank, payment made
  RC = 'RC',           // Received Confirmation Stage - Bank confirmed, payment made
  COMPLETED = 'COMPLETED'  // Final stage - Reconciliation complete, payment finalized
}

export enum RejectionStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED = 'RESOLVED'
}

export enum PennyDropStatus {
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  PENDING = 'PENDING'
}

export interface User {
  designation: string;
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  district?: string;
  permissions: string[];
  avatar?: string;
  createdAt?: Date;
  isActive:boolean;
  lastLoginAt?: Date;
  updatedAt?:Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  access_token: string;
  user: User;
  expiresIn: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Batch {
  id: string;
  batchId: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  correctedRecords?: number;
  status: BeneficiaryStage;
  amount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchFilter {
  currentStage?: BeneficiaryStage;  // Changed from status
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface Beneficiary {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaar: string;
  bankAccount: string;
  ifscCode: string;
  amount: number;
  district: string;
  housingPhase: 'G4' | 'L1' | 'L2' | 'L3';
  pennyDropStatus: PennyDropStatus;
  currentStage: BeneficiaryStage;  // Changed from paymentStatus to currentStage
  stagePayments: StagePayment[];  // Track payments at each stage
  rejectionStatus: RejectionStatus;
  rejectionReason?: string;
  retryCount: number;
  batchId: string;
  createdAt: string;
  updatedAt: string;
}

export interface StagePayment {
  stage: BeneficiaryStage;
  amount: number;
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed';
  bankReference?: string;
}

export interface BeneficiaryFilter {
  batchId?: string;
  currentStage?: BeneficiaryStage;  // Changed from status
  pennyDropStatus?: PennyDropStatus;
  rejectionStatus?: RejectionStatus;  // Added
  district?: string;
  housingPhase?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface PreprocessResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  correctedRecords: number;
  issues: ValidationIssue[];
  pennyDropVerified: number;
  pennyDropFailed: number;
  readyForPayment: number;
}

export interface ValidationIssue {
  field: string;
  issueCount: number;
  correctedCount: number;
  status: 'pass' | 'warning' | 'error';
}

export interface ReconciliationData {
  batchId: string;
  totalSent: number;
  totalConfirmed: number;
  totalRejected: number;
  amountSent: number;
  amountConfirmed: number;
  amountRejected: number;
  variance: number;
  variancePercentage: number;
  varianceStatus: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  rejectionBreakdown: RejectionType[];
}

export interface RejectionType {
  type: string;
  count: number;
  percentage: number;
}

export interface CheckpointData {
  stage: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  threshold: string;
  checkpointsEarned: number;
  progressPercentage: number;
  cumulativeAmount: number;
}

export interface DashboardStats {
  failedPayments: number;
  totalBeneficiaries: number;
  pennyDropVerified: number;
  pennyDropFailed: number;
  successfulPayments: number;
  rejectionRate: number;
  totalAmount: number;
  amountProcessed: number;
  amountReconciliated: number;
  checkpointsEarned: number;
  dataQualityScore: number;
  stageProgression: StageProgress[];
}

export interface StageProgress {
  stage: BeneficiaryStage;
  count: number;
  amount: number;
  percentage: number;
  paymentsComplete: number;
}

export interface UploadResponse {
  success: boolean;
  batchId: string;
  fileName: string;
  uploadedAt: string;
}

export interface ReportFilter {
  type: 'daily' | 'rejection' | 'reconciliation' | 'financial' | 'checkpoint' | 'district';
  batchId?: string;
  startDate?: string;
  endDate?: string;
  format?: 'pdf' | 'excel' | 'json';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  read: boolean;
  createdAt: string;
}



// types.ts - Shared TypeScript interfaces for Beneficiary module

export type WorkStage = 'BL' | 'RL' | 'RC' | 'COMPLETED';
export type TimelineEventType = 'BATCH_UPLOAD' | 'PENNY_DROP' | 'STAGE_CHANGE' | 'PAYMENT' | 'VERIFICATION' | 'FAILURE' | 'CORRECTION';
export type TimelineEventStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'WARNING';

export interface TimelineEvent {
  id: string;
  date: string;
  type: TimelineEventType;
  stage?: WorkStage;
  batchId: string;
  title: string;
  description: string;
  status: TimelineEventStatus;
  amount?: number;
  details?: Record<string, any>;
}

export interface Beneficiary {
  id: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  phoneNumber: string;
  address: string;
  village: string;
  mandal: string;
  district: string;
  currentStage: BeneficiaryStage;
  stageAmount: number;
  pennyDropStatus: PennyDropStatus;
  pennyDropDate: string | null;
  accountHolderName: string | null;
  pennyDropError: string | null;
  totalPaidSoFar: number;
  lastPaymentDate: string | null;
  timeline: TimelineEvent[];
  failureCount: number;
  correctionCount: number;
}

export interface BeneficiaryFilters {
  stage: string;
  pennyDrop: string;
  bank: string;
  district: string;
  paymentStatus: string;
  searchQuery: string;
}

export interface BeneficiaryStats {
  total: number;
  bl: number;
  rl: number;
  rc: number;
  completed: number;
  verified: number;
  failed: number;
  pending: number;
  withFailures: number;
  filtered: number;
}



// types.ts - Reconciliation Module Type Definitions

export type ReconciliationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING';
export type MatchStatus = 'MATCHED' | 'MISMATCHED' | 'MISSING_IN_UPLOAD' | 'MISSING_IN_BANK' | 'PENNY_DROP_MISMATCH';

// Bank Return File Record (NPCI Format)
export interface BankReturnRecord {
  achCode: string;
  beneBankIIN: string;
  aadhaarNumber: string;
  aadhaarName: string;
  dbtCode: string;
  amount: string; // Format: 0000020000000 = ₹2L
  npciResponseFlag: string; // "1" = Success, "0" = Failed
  responseCode: string; // "00" = Success, "58" = Credit limit, etc.
  accountNumber: string;
  rejectionReason: string; // "Completed" or failure reason
  beneBankName: string;
}

// Reconciliation Batch
export interface ReconciliationBatch {
  id: string;
  batchId: string;
  uploadDate: string;
  uploadedBy: string;
  processedDate: string | null;
  status: ReconciliationStatus;
  
  // Counts from original upload
  totalUploaded: number;
  withPennyDrop: number;
  withoutPennyDrop: number;
  pennyDropSuccess: number;
  pennyDropFailed: number;
  
  // Counts from bank return
  totalBankRecords: number;
  bankPaymentSuccess: number;
  bankPaymentFailed: number;
  
  // Reconciliation results
  matchedRecords: number;
  mismatchedRecords: number;
  missingInBank: number;
  missingInUpload: number;
  pennyDropMismatch: number;
  
  matchRate: number; // Percentage
  
  // Financial reconciliation
  totalAmountExpected: number;
  totalAmountPaid: number;
  amountVariance: number;
}

// Reconciliation Record (Individual beneficiary reconciliation)
export interface ReconciliationRecord {
  id: string;
  batchId: string;
  beneficiaryId: string;
  name: string;
  aadhaarNumber: string;
  accountNumber: string;
  
  // Upload data
  wasUploaded: boolean;
  uploadedAmount: number;
  
  // Penny drop data
  pennyDropStatus: 'SUCCESS' | 'FAILED' | 'NOT_DONE';
  pennyDropVerifiedName: string | null;
  
  // Bank payment data
  bankPaymentFound: boolean;
  bankPaymentStatus: PaymentStatus;
  bankPaidAmount: number;
  npciResponseFlag: string;
  responseCode: string;
  rejectionReason: string | null;
  
  // Reconciliation status
  matchStatus: MatchStatus;
  issues: string[];
  requiresInvestigation: boolean;
  
  // Timestamps
  uploadDate: string;
  bankProcessedDate: string | null;
}

// Rejection Reason Breakdown
export interface RejectionBreakdown {
  code: string;
  reason: string;
  count: number;
  percentage: number;
  amount: number;
}

// Stage-wise Reconciliation
export interface StageReconciliation {
  stage: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  uploaded: number;
  pennyDropSuccess: number;
  pennyDropFailed: number;
  paymentSuccess: number;
  paymentFailed: number;
  successRate: number;
  totalAmount: number;
  paidAmount: number;
}

// Reconciliation Summary
export interface ReconciliationSummary {
  batchId: string;
  reconciliationDate: string;
  
  // Upload stats
  totalUploaded: number;
  withPennyDrop: number;
  withoutPennyDrop: number;
  
  // Penny drop stats
  pennyDropAttempted: number;
  pennyDropSuccess: number;
  pennyDropFailed: number;
  pennyDropSuccessRate: number;
  
  // Bank payment stats
  bankRecordsReceived: number;
  paymentsSuccessful: number;
  paymentsFailed: number;
  paymentSuccessRate: number;
  
  // Cross-checks
  uploadedVsPennyDrop: {
    matched: number;
    mismatched: number;
  };
  pennyDropVsPayment: {
    bothSuccess: number;
    pennyDropSuccessPaymentFailed: number;
    pennyDropFailedPaymentSuccess: number; // CRITICAL ISSUE
    bothFailed: number;
  };
  uploadedVsPayment: {
    matched: number;
    missingInBank: number;
    extraInBank: number;
  };
  
  // Financial reconciliation
  totalExpectedAmount: number;
  totalPaidAmount: number;
  variance: number;
  variancePercentage: number;
  
  // Stage-wise breakdown
  stageBreakdown: StageReconciliation[];
  
  // Rejection breakdown
  rejections: RejectionBreakdown[];
  
  // Critical issues
  criticalIssuesCount: number;
  requiresInvestigationCount: number;
}

// Reconciliation Filters
export interface ReconciliationFilters {
  matchStatus: string;
  paymentStatus: string;
  pennyDropStatus: string;
  stage: string;
  hasIssues: string;
  searchQuery: string;
}

// Reconciliation Stats
export interface ReconciliationStats {
  total: number;
  matched: number;
  mismatched: number;
  paymentSuccess: number;
  paymentFailed: number;
  pennyDropSuccess: number;
  pennyDropFailed: number;
  criticalIssues: number;
  filtered: number;
}