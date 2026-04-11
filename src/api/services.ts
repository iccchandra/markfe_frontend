// ============================================
// api/services.ts — API service functions for all modules
// ============================================
import apiClient from './apiClient';
import type {
  User, District, PACSEntity, Season, LoanSanction, Bank, UtilizationHead,
  DistrictDrawdown, DistrictUtilization, DistrictFarmers, DashboardSummary,
} from '../types/markfed';

// ─── Auth ─────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post<{ access_token: string; refresh_token: string; user: User }>('/auth/login', { email, password }),
  refresh: (refreshToken: string) =>
    apiClient.post<{ access_token: string }>('/auth/refresh', { refresh_token: refreshToken }),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get<User>('/auth/me'),
};

// ─── Users (SUPER_ADMIN) ─────────────────────────
export const usersAPI = {
  list: () => apiClient.get<User[]>('/users'),
  get: (id: number) => apiClient.get<User>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) => apiClient.post<User>('/users', data),
  update: (id: number, data: Partial<User>) => apiClient.patch<User>(`/users/${id}`, data),
  deactivate: (id: number) => apiClient.delete(`/users/${id}`),
  resetPassword: (id: number) => apiClient.post(`/users/${id}/reset-password`),
};

// ─── Districts ────────────────────────────────────
export const districtsAPI = {
  list: () => apiClient.get<District[]>('/districts'),
  create: (data: Partial<District>) => apiClient.post<District>('/districts', data),
  update: (id: number, data: Partial<District>) => apiClient.patch<District>(`/districts/${id}`, data),
};

// ─── PACS Entities ────────────────────────────────
export const pacsAPI = {
  list: (districtId?: number) =>
    apiClient.get<PACSEntity[]>('/pacs', { params: districtId ? { district_id: districtId } : {} }),
  create: (data: Partial<PACSEntity>) => apiClient.post<PACSEntity>('/pacs', data),
  update: (id: number, data: Partial<PACSEntity>) => apiClient.patch<PACSEntity>(`/pacs/${id}`, data),
};

// ─── Banks ────────────────────────────────────────
export const banksAPI = {
  list: (params?: { search?: string; is_active?: boolean }) =>
    apiClient.get<Bank[]>('/banks', { params }),
  get: (id: number) => apiClient.get<Bank>(`/banks/${id}`),
  create: (data: Partial<Bank>) => apiClient.post<Bank>('/banks', data),
  update: (id: number, data: Partial<Bank>) => apiClient.patch<Bank>(`/banks/${id}`, data),
};

// ─── Utilization Heads ────────────────────────────
export const utilizationHeadsAPI = {
  list: (params?: { search?: string; is_active?: boolean }) =>
    apiClient.get<UtilizationHead[]>('/utilization-heads', { params }),
  get: (id: number) => apiClient.get<UtilizationHead>(`/utilization-heads/${id}`),
  create: (data: Partial<UtilizationHead>) => apiClient.post<UtilizationHead>('/utilization-heads', data),
  update: (id: number, data: Partial<UtilizationHead>) => apiClient.patch<UtilizationHead>(`/utilization-heads/${id}`, data),
};

// ─── Seasons ──────────────────────────────────────
export const seasonsAPI = {
  list: () => apiClient.get<Season[]>('/seasons'),
  active: () => apiClient.get<Season>('/seasons/active'),
  create: (data: Partial<Season>) => apiClient.post<Season>('/seasons', data),
  update: (id: number, data: Partial<Season>) => apiClient.patch<Season>(`/seasons/${id}`, data),
};

// ─── Loan Sanction (AO_CAO) ──────────────────────
export const loanSanctionAPI = {
  list: (seasonId: number) => apiClient.get<LoanSanction[]>(`/loan-sanction/${seasonId}`),
  create: (seasonId: number, data: Partial<LoanSanction>) =>
    apiClient.post<LoanSanction>(`/loan-sanction/${seasonId}`, data),
  update: (seasonId: number, id: number, data: Partial<LoanSanction>) =>
    apiClient.patch<LoanSanction>(`/loan-sanction/${seasonId}/${id}`, data),
  delete: (seasonId: number, id: number) =>
    apiClient.delete(`/loan-sanction/${seasonId}/${id}`),
  submit: (seasonId: number, id: number) =>
    apiClient.post(`/loan-sanction/${seasonId}/${id}/submit`),
  approve: (seasonId: number, id: number) =>
    apiClient.post(`/loan-sanction/${seasonId}/${id}/approve`),
  reject: (seasonId: number, id: number, reason: string) =>
    apiClient.post(`/loan-sanction/${seasonId}/${id}/reject`, { reason }),
};

// ─── District Drawdowns (AO_CAO) ─────────────────
export const drawdownsAPI = {
  list: (seasonId: number) => apiClient.get<DistrictDrawdown[]>(`/drawdowns/${seasonId}`),
  getByDistrict: (seasonId: number, districtId: number) =>
    apiClient.get<DistrictDrawdown[]>(`/drawdowns/${seasonId}/${districtId}`),
  create: (seasonId: number, data: Partial<DistrictDrawdown>) =>
    apiClient.post<DistrictDrawdown>(`/drawdowns/${seasonId}`, data),
  update: (seasonId: number, drawdownId: number, data: Partial<DistrictDrawdown>) =>
    apiClient.patch<DistrictDrawdown>(`/drawdowns/${seasonId}/${drawdownId}`, data),
  delete: (seasonId: number, drawdownId: number) =>
    apiClient.delete(`/drawdowns/${seasonId}/${drawdownId}`),
  submit: (seasonId: number, drawdownId: number) =>
    apiClient.post(`/drawdowns/${seasonId}/${drawdownId}/submit`),
  approve: (seasonId: number, drawdownId: number) =>
    apiClient.post(`/drawdowns/${seasonId}/${drawdownId}/approve`),
  reject: (seasonId: number, drawdownId: number, reason: string) =>
    apiClient.post(`/drawdowns/${seasonId}/${drawdownId}/reject`, { reason }),
};

// ─── District Utilization (DM) ───────────────────
export const utilizationAPI = {
  listAll: (seasonId: number) =>
    apiClient.get<DistrictUtilization[]>(`/utilization/${seasonId}`),
  listByDistrict: (seasonId: number, districtId: number) =>
    apiClient.get<DistrictUtilization[]>(`/utilization/${seasonId}/district/${districtId}`),
  get: (seasonId: number, id: number) =>
    apiClient.get<DistrictUtilization>(`/utilization/${seasonId}/record/${id}`),
  create: (seasonId: number, data: any) =>
    apiClient.post<DistrictUtilization>(`/utilization/${seasonId}`, data),
  update: (seasonId: number, id: number, data: any) =>
    apiClient.patch<DistrictUtilization>(`/utilization/${seasonId}/${id}`, data),
  delete: (seasonId: number, id: number) =>
    apiClient.delete(`/utilization/${seasonId}/${id}`),
  submit: (seasonId: number, id: number) =>
    apiClient.post(`/utilization/${seasonId}/${id}/submit`),
  approve: (seasonId: number, id: number) =>
    apiClient.post(`/utilization/${seasonId}/${id}/approve`),
  reject: (seasonId: number, id: number, reason: string) =>
    apiClient.post(`/utilization/${seasonId}/${id}/reject`, { reason }),
};

// ─── District Farmers (DM) ───────────────────────
export const farmersAPI = {
  listAll: (seasonId: number) =>
    apiClient.get<DistrictFarmers[]>(`/farmers/${seasonId}`),
  listByDistrict: (seasonId: number, districtId: number) =>
    apiClient.get<DistrictFarmers[]>(`/farmers/${seasonId}/district/${districtId}`),
  get: (seasonId: number, id: number) =>
    apiClient.get<DistrictFarmers>(`/farmers/${seasonId}/record/${id}`),
  create: (seasonId: number, data: any) =>
    apiClient.post<DistrictFarmers>(`/farmers/${seasonId}`, data),
  update: (seasonId: number, id: number, data: any) =>
    apiClient.patch<DistrictFarmers>(`/farmers/${seasonId}/${id}`, data),
  delete: (seasonId: number, id: number) =>
    apiClient.delete(`/farmers/${seasonId}/${id}`),
  submit: (seasonId: number, id: number) =>
    apiClient.post(`/farmers/${seasonId}/${id}/submit`),
  approve: (seasonId: number, id: number) =>
    apiClient.post(`/farmers/${seasonId}/${id}/approve`),
  reject: (seasonId: number, id: number, reason: string) =>
    apiClient.post(`/farmers/${seasonId}/${id}/reject`, { reason }),
};

// ─── Dashboard ────────────────────────────────────
export const dashboardAPI = {
  summary: (seasonId: number) =>
    apiClient.get<DashboardSummary>(`/dashboard/summary/${seasonId}`),
  districtSummary: (seasonId: number, districtId: number) =>
    apiClient.get(`/dashboard/district/${seasonId}/${districtId}`),
};

// ─── Reconciliation ──────────────────────────────
export const reconciliationAPI = {
  variance: (seasonId: number) => apiClient.get(`/reconciliation/variance/${seasonId}`),
  commodity: (seasonId: number) => apiClient.get(`/reconciliation/commodity/${seasonId}`),
  status: (seasonId: number) => apiClient.get(`/reconciliation/status/${seasonId}`),
  bills: (seasonId: number, commodityId?: number) =>
    apiClient.get(`/reconciliation/bills/${seasonId}`, { params: commodityId ? { commodity_id: commodityId } : {} }),
};

// ─── Commodities ─────────────────────────────────
export const commoditiesAPI = {
  list: () => apiClient.get<any[]>('/commodities'),
  get: (id: number) => apiClient.get<any>(`/commodities/${id}`),
  create: (data: any) => apiClient.post('/commodities', data),
  update: (id: number, data: any) => apiClient.patch(`/commodities/${id}`, data),
};

// ─── Season Commodities ─────────────────────────
export const seasonCommoditiesAPI = {
  list: (seasonId: number) => apiClient.get<any[]>(`/season-commodities/${seasonId}`),
  get: (seasonId: number, id: number) => apiClient.get<any>(`/season-commodities/${seasonId}/${id}`),
  getByComm: (seasonId: number, commodityId: number) => apiClient.get<any>(`/season-commodities/${seasonId}/commodity/${commodityId}`),
  create: (seasonId: number, data: any) => apiClient.post(`/season-commodities/${seasonId}`, data),
  update: (seasonId: number, id: number, data: any) => apiClient.patch(`/season-commodities/${seasonId}/${id}`, data),
};

// ─── Procurement Centres ────────────────────────
export const procurementCentresAPI = {
  list: (scId: number) => apiClient.get<any[]>(`/procurement-centres/${scId}`),
  listByDistrict: (scId: number, districtId: number) => apiClient.get<any[]>(`/procurement-centres/${scId}/district/${districtId}`),
  get: (scId: number, id: number) => apiClient.get<any>(`/procurement-centres/${scId}/${id}`),
  create: (scId: number, data: any) => apiClient.post(`/procurement-centres/${scId}`, data),
  update: (scId: number, id: number, data: any) => apiClient.patch(`/procurement-centres/${scId}/${id}`, data),
  delete: (scId: number, id: number) => apiClient.delete(`/procurement-centres/${scId}/${id}`),
};

// ─── District Production ────────────────────────
export const districtProductionAPI = {
  list: (scId: number) => apiClient.get<any[]>(`/district-production/${scId}`),
  get: (scId: number, districtId: number) => apiClient.get<any>(`/district-production/${scId}/${districtId}`),
  upsert: (scId: number, data: any) => apiClient.post(`/district-production/${scId}`, data),
  submit: (scId: number, id: number) => apiClient.patch(`/district-production/${scId}/${id}/submit`),
  verify: (scId: number, id: number) => apiClient.patch(`/district-production/${scId}/${id}/verify`),
  approve: (scId: number, id: number) => apiClient.patch(`/district-production/${scId}/${id}/approve`),
  reject: (scId: number, id: number, reason: string) => apiClient.patch(`/district-production/${scId}/${id}/reject`, { reason }),
};

// ─── Procurement Tracking ───────────────────────
export const procurementTrackingAPI = {
  list: (scId: number) => apiClient.get<any[]>(`/procurement-tracking/${scId}`),
  get: (scId: number, id: number) => apiClient.get<any>(`/procurement-tracking/${scId}/${id}`),
  summary: (scId: number) => apiClient.get<any>(`/procurement-tracking/${scId}/summary`),
  create: (scId: number, data: any) => apiClient.post(`/procurement-tracking/${scId}`, data),
  update: (scId: number, id: number, data: any) => apiClient.patch(`/procurement-tracking/${scId}/${id}`, data),
  submit: (scId: number, id: number) => apiClient.patch(`/procurement-tracking/${scId}/${id}/submit`),
  verify: (scId: number, id: number) => apiClient.patch(`/procurement-tracking/${scId}/${id}/verify`),
  approve: (scId: number, id: number) => apiClient.patch(`/procurement-tracking/${scId}/${id}/approve`),
  reject: (scId: number, id: number, reason: string) => apiClient.patch(`/procurement-tracking/${scId}/${id}/reject`, { reason }),
};

// ─── Godowns ────────────────────────────────────
export const godownsAPI = {
  list: (districtId?: number) => apiClient.get<any[]>('/godowns', { params: districtId ? { district_id: districtId } : {} }),
  get: (id: number) => apiClient.get<any>(`/godowns/${id}`),
  create: (data: any) => apiClient.post('/godowns', data),
  update: (id: number, data: any) => apiClient.patch(`/godowns/${id}`, data),
  delete: (id: number) => apiClient.delete(`/godowns/${id}`),
};

// ─── H&T Contractors ────────────────────────────
export const htContractorsAPI = {
  list: () => apiClient.get<any[]>('/ht-contractors'),
  get: (id: number) => apiClient.get<any>(`/ht-contractors/${id}`),
  create: (data: any) => apiClient.post('/ht-contractors', data),
  update: (id: number, data: any) => apiClient.patch(`/ht-contractors/${id}`, data),
  delete: (id: number) => apiClient.delete(`/ht-contractors/${id}`),
};

// ─── Godown Contractors ─────────────────────────
export const godownContractorsAPI = {
  list: (seasonId: number) => apiClient.get<any[]>(`/godown-contractors/${seasonId}`),
  get: (seasonId: number, id: number) => apiClient.get<any>(`/godown-contractors/${seasonId}/${id}`),
  create: (seasonId: number, data: any) => apiClient.post(`/godown-contractors/${seasonId}`, data),
  update: (seasonId: number, id: number, data: any) => apiClient.patch(`/godown-contractors/${seasonId}/${id}`, data),
  delete: (seasonId: number, id: number) => apiClient.delete(`/godown-contractors/${seasonId}/${id}`),
};

// ─── Unloading Bills ────────────────────────────
export const unloadingBillsAPI = {
  list: (seasonId: number, params?: { commodity_id?: number; district_id?: number }) =>
    apiClient.get<any[]>(`/unloading-bills/${seasonId}`, { params }),
  get: (seasonId: number, id: number) => apiClient.get<any>(`/unloading-bills/${seasonId}/${id}`),
  create: (seasonId: number, data: any) => apiClient.post(`/unloading-bills/${seasonId}`, data),
  update: (seasonId: number, id: number, data: any) => apiClient.patch(`/unloading-bills/${seasonId}/${id}`, data),
  certify: (seasonId: number, id: number) => apiClient.post(`/unloading-bills/${seasonId}/${id}/certify`),
  verify: (seasonId: number, id: number, data: any) => apiClient.post(`/unloading-bills/${seasonId}/${id}/verify`, data),
  approve: (seasonId: number, id: number, data: any) => apiClient.post(`/unloading-bills/${seasonId}/${id}/approve`, data),
  reject: (seasonId: number, id: number, reason: string) => apiClient.post(`/unloading-bills/${seasonId}/${id}/reject`, { reason }),
};

// ─── Transport Trips ────────────────────────────
export const transportTripsAPI = {
  list: (seasonId: number, params?: { commodity_id?: number; district_id?: number; status?: string }) =>
    apiClient.get<any[]>(`/transport-trips/${seasonId}`, { params }),
  get: (seasonId: number, id: number) => apiClient.get<any>(`/transport-trips/${seasonId}/${id}`),
  create: (seasonId: number, data: any) => apiClient.post(`/transport-trips/${seasonId}`, data),
  update: (seasonId: number, id: number, data: any) => apiClient.patch(`/transport-trips/${seasonId}/${id}`, data),
  submit: (seasonId: number, id: number) => apiClient.post(`/transport-trips/${seasonId}/${id}/submit`),
  verify: (seasonId: number, id: number, data: any) => apiClient.post(`/transport-trips/${seasonId}/${id}/verify`, data),
  approve: (seasonId: number, id: number, data: any) => apiClient.post(`/transport-trips/${seasonId}/${id}/approve`, data),
  reject: (seasonId: number, id: number, reason: string) => apiClient.post(`/transport-trips/${seasonId}/${id}/reject`, { reason }),
};

// ─── Transport Bills ────────────────────────────
export const transportBillsAPI = {
  list: (seasonId: number, params?: { commodity_id?: number; district_id?: number; status?: string }) =>
    apiClient.get<any[]>(`/transport-bills/${seasonId}`, { params }),
  get: (seasonId: number, id: number) => apiClient.get<any>(`/transport-bills/${seasonId}/${id}`),
  create: (seasonId: number, data: any) => apiClient.post(`/transport-bills/${seasonId}`, data),
  update: (seasonId: number, id: number, data: any) => apiClient.patch(`/transport-bills/${seasonId}/${id}`, data),
  delete: (seasonId: number, id: number) => apiClient.delete(`/transport-bills/${seasonId}/${id}`),
  aggregate: (seasonId: number, id: number) => apiClient.post(`/transport-bills/${seasonId}/${id}/aggregate`),
  submit: (seasonId: number, id: number) => apiClient.post(`/transport-bills/${seasonId}/${id}/submit`),
  verify: (seasonId: number, id: number, data: any) => apiClient.post(`/transport-bills/${seasonId}/${id}/verify`, data),
  approve: (seasonId: number, id: number, data: any) => apiClient.post(`/transport-bills/${seasonId}/${id}/approve`, data),
  reject: (seasonId: number, id: number, reason: string) => apiClient.post(`/transport-bills/${seasonId}/${id}/reject`, { reason }),
};

// ─── Gunny Suppliers ────────────────────────────
export const gunnySuppliersAPI = {
  list: (districtId?: number) => apiClient.get<any[]>('/gunny-suppliers', { params: districtId ? { district_id: districtId } : {} }),
  get: (id: number) => apiClient.get<any>(`/gunny-suppliers/${id}`),
  create: (data: any) => apiClient.post('/gunny-suppliers', data),
  update: (id: number, data: any) => apiClient.patch(`/gunny-suppliers/${id}`, data),
  delete: (id: number) => apiClient.delete(`/gunny-suppliers/${id}`),
};

// ─── Gunny Utilization ──────────────────────────
export const gunnyUtilizationAPI = {
  list: (seasonId: number, params?: { commodity_id?: number; district_id?: number }) =>
    apiClient.get<any[]>(`/gunny-utilization/${seasonId}`, { params }),
  get: (seasonId: number, id: number) => apiClient.get<any>(`/gunny-utilization/${seasonId}/${id}`),
  create: (seasonId: number, data: any) => apiClient.post(`/gunny-utilization/${seasonId}`, data),
  update: (seasonId: number, id: number, data: any) => apiClient.patch(`/gunny-utilization/${seasonId}/${id}`, data),
  submit: (seasonId: number, id: number) => apiClient.post(`/gunny-utilization/${seasonId}/${id}/submit`),
  verify: (seasonId: number, id: number, data: any) => apiClient.post(`/gunny-utilization/${seasonId}/${id}/verify`, data),
  approve: (seasonId: number, id: number, data: any) => apiClient.post(`/gunny-utilization/${seasonId}/${id}/approve`, data),
  reject: (seasonId: number, id: number, reason: string) => apiClient.post(`/gunny-utilization/${seasonId}/${id}/reject`, { reason }),
};

// ─── Historical Procurement ─────────────────────
export const historicalProcurementAPI = {
  list: (commodityId?: number) => apiClient.get<any[]>('/historical-procurement', { params: commodityId ? { commodity_id: commodityId } : {} }),
  byCommodity: (commodityId: number) => apiClient.get<any[]>(`/historical-procurement/commodity/${commodityId}`),
  bulkCreate: (data: any[]) => apiClient.post('/historical-procurement/bulk', data),
};

// ─── DPR ────────────────────────────────────────
export const dprAPI = {
  summary: (seasonId: number) => apiClient.get<any>(`/dpr/${seasonId}`),
  commodity: (seasonId: number, commodityId: number) => apiClient.get<any>(`/dpr/${seasonId}/commodity/${commodityId}`),
};

// ─── Dashboard (extended) ───────────────────────
export const dashboardCommoditiesAPI = {
  commodities: (seasonId: number) => apiClient.get<any>(`/dashboard/commodities/${seasonId}`),
  procurementStatus: (seasonId: number) => apiClient.get<any>(`/dashboard/procurement-status/${seasonId}`),
};

// ─── Import ─────────────────────────────────────
export const importAPI = {
  preview: (file: File, maxRows?: number) => {
    const fd = new FormData();
    fd.append('file', file);
    if (maxRows) fd.append('maxRows', String(maxRows));
    return apiClient.post<any>('/import/preview', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  excel: (seasonId: number, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post<any>(`/import/excel/${seasonId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  dpr: (seasonId: number, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post<any>(`/import/dpr/${seasonId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

// ─── Export ───────────────────────────────────────
export const exportAPI = {
  excel: (seasonId: number, districtId?: number) => {
    const url = districtId
      ? `/export/excel/${seasonId}/${districtId}`
      : `/export/excel/${seasonId}`;
    return apiClient.get(url, { responseType: 'blob' });
  },
  pdf: (seasonId: number) =>
    apiClient.get(`/export/pdf/${seasonId}`, { responseType: 'blob' }),
  dpr: (seasonId: number) =>
    apiClient.get(`/export/dpr/${seasonId}`, { responseType: 'blob' }),
  commodity: (seasonId: number, commodityId: number) =>
    apiClient.get(`/export/commodity/${seasonId}/${commodityId}`, { responseType: 'blob' }),
};
