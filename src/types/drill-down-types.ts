/**
 * DRILL-DOWN FEATURE TYPES - UPDATED
 * Type definitions for hierarchical drill-down reporting
 * ✅ Updated to match actual backend response
 */

export type DrillDownLevelType = 'DISTRICT' | 'MANDAL' | 'VILLAGE' | 'BENEFICIARY';

export interface DrillDownLevel {
  type: DrillDownLevelType;
  district?: string;
  mandal?: string;
  village?: string;
}

export interface DrillDownAggregates {
  notPostedToBankCount: any;
  mdApprovedCount: any;
  totalBeneficiaries: number;
  totalAmount: number;
  totalAmountFormatted: string;
  mdApprovedAmount: number;
  mdApprovedAmountFormatted: string;
  bankPaidAmount: number;
  bankPaidAmountFormatted: string;
  notPostedToBankAmount: number;
  notPostedToBankAmountFormatted: string;
  successAmount: number;
  successAmountFormatted: string;
  failedAmount: number;
  failedAmountFormatted: string;
}

export interface DistrictData {
  district: string;
  totalBeneficiaries: number;
  totalAmount: number;
  totalAmountFormatted: string;
  mdApproved: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
  notPostedToBank: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
  bankPaid: {
    totalAmount: number;
    totalAmountFormatted: string;
  };
  success: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
  failed: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
}

export interface MandalData {
  mandal: string;
  totalBeneficiaries: number;
  totalAmount: number;
  totalAmountFormatted: string;
  mdApproved: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
  notPostedToBank: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
  bankPaid: {
    totalAmount: number;
    totalAmountFormatted: string;
  };
  success: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
  failed: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
}

export interface VillageData {
  village: string;
  totalBeneficiaries: number;
  totalAmount: number;
  totalAmountFormatted: string;
  mdApproved: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
  notPostedToBank: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
  bankPaid: {
    totalAmount: number;
    totalAmountFormatted: string;
  };
  success: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
  failed: {
    count: number;
    amount: number;
    amountFormatted: string;
  };
}

/**
 * ✅ UPDATED BeneficiaryData interface to match actual backend response
 * Based on the actual API response from getBeneficiaryDrillDown
 */
export interface BeneficiaryData {
  id: string;
  beneficiaryId: string;
  applicantName: string;
  district: string;
  mandal: string;
  village: string;
  stage: 'PENNY_DROP' | 'BL' | 'RL' | 'RC' | 'COMPLETED';
  amountInRupees: number;
  
  // ✅ FIXED: Backend returns mdApproved (boolean), not approvalByMD
  mdApproved: boolean;
  
  // ✅ FIXED: Backend returns bankStatus (string), not bankPaymentStatus
  bankStatus: 'Success' | 'Failed' | 'Pending' | 'Not Posted';

  amountFormatted?: string;         // Formatted in crores (e.g., "₹0.03 Cr")
  
  
  postedToBank: boolean;
  dateOfApproval?: string | Date;
  approvedBy?: string;
  responseCode?: string;
  uploadDate?: string | Date;
  bankProcessedDate?: string | Date;
}

export interface DrillDownResponse<T> {
  success: boolean;
  level: DrillDownLevelType;
  district?: string;
  mandal?: string;
  village?: string;
  total?: number;
  data?: T[];
  beneficiaries?: BeneficiaryData[];
  aggregates?: DrillDownAggregates;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}