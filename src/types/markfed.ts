// ============================================
// types/markfed.ts — Core types for Maize MSP Portal
// ============================================

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  MD = 'md',
  GM = 'gm',
  AO_CAO = 'ao_cao',
  MANAGER_PROCUREMENT = 'manager_procurement',
  MANAGER_HR = 'manager_hr',
  DM = 'dm',
}

export type ApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  district_id: number | null;
  district_name?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface District {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface PACSEntity {
  id: number;
  district_id: number;
  name: string;
  type: 'PACS' | 'DCMS' | 'FPO';
  is_active: boolean;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
  ifsc_code?: string;
  is_active: boolean;
}

export interface UtilizationHead {
  id: number;
  name: string;
  code: string;
  display_order: number;
  entry_role: string;
  is_active: boolean;
}

export interface UtilizationEntry {
  id?: number;
  utilization_head_id: number;
  utilization_head?: UtilizationHead;
  amount_rs: number;
}

export interface Season {
  id: number;
  season_name: string;
  crop: string;
  msp_rate: number;
  go_number: string;
  go_date: string;
  total_sanctioned_cr: number;
  is_active: boolean;
  created_at?: string;
}

export interface LoanSanction {
  id?: number;
  season_id: number;
  source_type?: 'bank' | 'other';
  go_reference: string;
  bank_name: string;
  bank_id?: number;
  bank?: Bank;
  bank_account_no: string;
  sanction_date: string;
  total_sanctioned_cr: number;
  total_drawn_cr: number;
  transfer_bank_name: string;
  transfer_bank_id?: number;
  transfer_bank?: Bank;
  kotak_account_no: string;
  status?: ApprovalStatus;
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  updated_by?: number;
  updated_at?: string;
}

export interface DistrictDrawdown {
  id?: number;
  season_id: number;
  district_id: number;
  district_name?: string;
  amount_withdrawn_rs: number;
  withdrawn_date: string;
  transfer_date: string;
  utr_no: string;
  status?: ApprovalStatus;
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DistrictUtilization {
  id?: number;
  season_id: number;
  district_id: number;
  district_name?: string;
  drawdown_id?: number;
  // Legacy hardcoded fields (backward compat)
  farmers_payment_rs?: number;
  gunnies_payment_rs?: number;
  transportation_payment_rs?: number;
  unloading_payment_rs?: number;
  storage_charges_rs?: number;
  fertiliser_companies_rs?: number;
  fertiliser_ht_rs?: number;
  other_loan_interest_rs?: number;
  monthly_interest_rs?: number;
  other_loan_repayments_rs?: number;
  others_rs?: number;
  // Dynamic entries
  entries?: UtilizationEntry[];
  remarks: string;
  status?: ApprovalStatus;
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  last_saved_at?: string;
  updated_by?: number;
}

export interface DistrictFarmers {
  id?: number;
  season_id: number;
  district_id: number;
  district_name?: string;
  pacs_count?: number;
  pacs_entity_id: number | null;
  pacs_entity_name?: string;
  pacs_entity_type?: 'PACS' | 'DCMS' | 'FPO';
  farmers_count: number;
  quantity_procured_qtl: number;
  cost_of_procured_qty_rs: number;
  payment_released_to_farmers_rs: number;
  remarks: string;
  status?: ApprovalStatus;
  submitted_by?: number;
  submitted_at?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  last_saved_at?: string;
  updated_by?: number;
}

export interface DashboardSummary {
  total_sanctioned_cr: number;
  total_drawn_cr: number;
  total_utilised_rs: number;
  total_balance_rs: number;
  district_wise_summary: DistrictSummaryRow[];
}

export interface DistrictSummaryRow {
  district_id: number;
  district_name: string;
  amount_received_rs: number;
  farmers_paid_rs: number;
  gunnies_rs: number;
  transportation_rs: number;
  unloading_rs: number;
  storage_rs: number;
  total_utilised_rs: number;
  balance_rs: number;
  status?: ApprovalStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Calculated field helpers — supports both legacy flat fields and dynamic entries
export function calcTotalUtilization(u: Partial<DistrictUtilization>): number {
  // If dynamic entries exist, sum those
  if (u.entries && u.entries.length > 0) {
    return u.entries.reduce((sum, e) => sum + (Number(e.amount_rs) || 0), 0);
  }
  // Fallback to legacy hardcoded fields
  return (
    (u.farmers_payment_rs || 0) +
    (u.gunnies_payment_rs || 0) +
    (u.transportation_payment_rs || 0) +
    (u.unloading_payment_rs || 0) +
    (u.storage_charges_rs || 0) +
    (u.fertiliser_companies_rs || 0) +
    (u.fertiliser_ht_rs || 0) +
    (u.other_loan_interest_rs || 0) +
    (u.monthly_interest_rs || 0) +
    (u.other_loan_repayments_rs || 0) +
    (u.others_rs || 0)
  );
}

export function calcCostOfProcuredQty(quantityQtl: number, mspRate: number): number {
  return quantityQtl * mspRate;
}

export function formatIndianCurrency(amount: number): string {
  if (amount === 0) return '0';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return isNegative ? `-${formatted}` : formatted;
}

export function formatCrores(amount: number): string {
  return formatIndianCurrency(amount) + ' Cr';
}

// Smart formatter: shows in Cr if >= 1 Cr, Lakhs if >= 1 Lakh, else Rs
export function formatAmount(amountRs: number): string {
  if (amountRs === 0) return '0 Cr';
  const isNegative = amountRs < 0;
  const abs = Math.abs(amountRs);
  let formatted: string;
  if (abs >= 10000000) {
    // 1 Cr = 1,00,00,000
    const cr = abs / 10000000;
    formatted = cr.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + ' Cr';
  } else if (abs >= 100000) {
    // 1 Lakh = 1,00,000
    const lakhs = abs / 100000;
    formatted = lakhs.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }) + ' L';
  } else {
    formatted = 'Rs. ' + abs.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  }
  return isNegative ? `-${formatted}` : formatted;
}

// MySQL DECIMAL fields come back as strings — coerce to number
export function num(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}

// Flatten nested district object from backend response
export function flattenDistrict(row: any): string {
  return row?.district?.name || row?.district_name || '';
}

// Flatten nested pacs_entity
export function flattenPacs(row: any): string {
  return row?.pacs_entity?.name || row?.pacs_entity_name || '';
}

export function flattenPacsType(row: any): string {
  return row?.pacs_entity?.type || row?.pacs_entity_type || '';
}
