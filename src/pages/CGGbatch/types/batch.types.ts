// ═══════════════════════════════════════════════════════════════════════════
// FILE: types/batch.types.ts
// Type definitions matching the validation-analysis controller responses
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY & DISTRIBUTION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface StatusDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface BatchSummary {
  totalRecords: number;
  lowValidation: number;
  mediumValidation: number;
  highValidation: number;
  criticalValidation: number;
  allowedToProcess: number;
  blocked: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BatchDownloads {
  excelUrl: string | null;
  jsonUrl: string | null;
  excelFilename: string | null;
  jsonFilename: string | null;
}

export interface Batch {
  id: number;
  batchId: string;
  originalFilename: string;
  status: string;
  uploadedAt: string;
  completedAt: string | null;
  processingTime: string;
  summary: BatchSummary;
  downloads: BatchDownloads;
  statusDistribution: StatusDistribution;
  errorMessage: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// BENEFICIARY RESULT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BeneficiaryResult {
  beneficiaryId: string;
  beneficiaryName: string;
  aadhaarNumber: string;
  accountNumber: string;
  amount: number;
  stage: string;
  bankName: string;
  validationLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isBlocked: boolean;
  recommendation: string;
  decision: string;
}

export interface PaginatedResults {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  data: BeneficiaryResult[];
}

export interface FilterOptions {
  availableLevels: string[];
  currentFilter: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// API RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface BatchListResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  batches: Batch[];
}

export interface BatchDetailsResponse {
  success: boolean;
  batch: Batch;
  summary: BatchSummary;
  results: PaginatedResults;
  filterOptions: FilterOptions;
}

// ═══════════════════════════════════════════════════════════════════════════
// UPLOAD RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UploadSummary {
  totalRecords: number;
  lowValidation: number;
  mediumValidation: number;
  highValidation: number;
  criticalValidation: number;
  allowedToProcess: number;
  blocked: number;
  lastFailureCount: number;
  criticalFailureCount: number;
  highFailureCount: number;
}

export interface UploadFiles {
  excelPath: string;
  excelUrl: string;
  jsonPath: string;
  jsonUrl: string;
}

export interface UploadRecommendations {
  readyToSend: number;
  needsReview: number;
  needsCorrection: number;
  blocked: number;
}

export interface BatchUploadResponse {
  success: boolean;
  batchId: string;
  uploadedAt: string;
  summary: UploadSummary;
  files: UploadFiles;
  recommendations: UploadRecommendations;
  processingTime: string;
  message: string;
  alerts: string[];
}