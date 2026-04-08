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
  get: (seasonId: number) => apiClient.get<LoanSanction>(`/loan-sanction/${seasonId}`),
  upsert: (seasonId: number, data: Partial<LoanSanction>) =>
    apiClient.put<LoanSanction>(`/loan-sanction/${seasonId}`, data),
  submit: (seasonId: number) => apiClient.post(`/loan-sanction/${seasonId}/submit`),
  approve: (seasonId: number) => apiClient.post(`/loan-sanction/${seasonId}/approve`),
  reject: (seasonId: number, reason: string) => apiClient.post(`/loan-sanction/${seasonId}/reject`, { reason }),
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
  get: (seasonId: number, districtId: number) =>
    apiClient.get<DistrictUtilization>(`/utilization/${seasonId}/${districtId}`),
  upsert: (seasonId: number, districtId: number, data: any) =>
    apiClient.put<DistrictUtilization>(`/utilization/${seasonId}/${districtId}`, data),
  submit: (seasonId: number, districtId: number) =>
    apiClient.post(`/utilization/${seasonId}/${districtId}/submit`),
  approve: (seasonId: number, districtId: number) =>
    apiClient.post(`/utilization/${seasonId}/${districtId}/approve`),
  reject: (seasonId: number, districtId: number, reason: string) =>
    apiClient.post(`/utilization/${seasonId}/${districtId}/reject`, { reason }),
};

// ─── District Farmers (DM) ───────────────────────
export const farmersAPI = {
  listAll: (seasonId: number) =>
    apiClient.get<DistrictFarmers[]>(`/farmers/${seasonId}`),
  get: (seasonId: number, districtId: number) =>
    apiClient.get<DistrictFarmers>(`/farmers/${seasonId}/${districtId}`),
  upsert: (seasonId: number, districtId: number, data: Partial<DistrictFarmers>) =>
    apiClient.put<DistrictFarmers>(`/farmers/${seasonId}/${districtId}`, data),
  submit: (seasonId: number, districtId: number) =>
    apiClient.post(`/farmers/${seasonId}/${districtId}/submit`),
  approve: (seasonId: number, districtId: number) =>
    apiClient.post(`/farmers/${seasonId}/${districtId}/approve`),
  reject: (seasonId: number, districtId: number, reason: string) =>
    apiClient.post(`/farmers/${seasonId}/${districtId}/reject`, { reason }),
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
  status: (seasonId: number) => apiClient.get(`/reconciliation/status/${seasonId}`),
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
};
