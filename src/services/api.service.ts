import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LoginRequest,
  LoginResponse,
  User,
  Batch,
  Beneficiary,
  BeneficiaryStage,
  RejectionStatus,
  ReconciliationData,
  PaginatedResponse,
  BatchFilter,
  BeneficiaryFilter,
  PreprocessResult,
  DashboardStats,
  UploadResponse,
  ReportFilter,
  Notification,
  CheckpointData
} from '../types';
import { DrillDownResponse, DistrictData, MandalData, VillageData, PaginationParams, BeneficiaryData } from '@/types/drill-down-types';

// Executive Dashboard Types
export interface ExecutiveDashboardFilters {
  stage?: string;
  stages?: string[];
  payment_with?: string;
  startDate?: string;
  endDate?: string;
}

// UPDATED INTERFACE - Only positive metrics
export interface ExecutiveDashboardData {
  overview: {
    total_beneficiaries: number;
    successful_beneficiaries: number;
    total_disbursed_amount: {
      crores: number;
    };
    total_successful_transactions: number;
    unique_penny_drops_done: number;
    unique_banks_involved: number;
    districts_covered: number;  // Added
  };
  stage_wise: Array<{
    stage_code: string;
    stage_name: string;
    beneficiary_count: number;
    total_amount: {
      crores: number;  // Changed: only crores now
    };
  }>;
  payment_methods: Array<{
    payment_method: string;
    beneficiary_count: number;
    percentage: number;
    total_amount: {
      crores: number;  // Changed: only crores now
    };
  }>;
  weekly_trend: Array<{  // Changed from monthly_trend to weekly_trend
    week: string;
    week_start_date: string;
    beneficiary_count: number;
    total_amount: {
      crores: number;  // Changed: only crores now
    };
  }>;
  amount_ranges: Array<{
    range: string;
    beneficiary_count: number;
    percentage: number;
  }>;
}

class ApiService {
  getRejectionBreakdown(selectedReconciliationId: string | undefined): any {
    throw new Error('Method not implemented.');
  }
  getPaymentTrend(trendDays: number, selectedReconciliationId: string | undefined): any {
    throw new Error('Method not implemented.');
  }
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://kotak-risk-analysis.alliantprojects.com',
      timeout: 90000, // ADDED: 60 second timeout to prevent timeout errors
    });

    this.token = localStorage.getItem('token');

    // Request interceptor
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ===== AUTH ENDPOINTS =====
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: AxiosResponse<LoginResponse> = await this.api.post('/api/v1/auth/login', credentials);
    this.setToken(response.data.access_token);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/api/v1/auth/profile');
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.removeToken();
    }
  }

  // ===== DASHBOARD ENDPOINTS =====
  async getDashboardStats(selectedReconciliationId: string | undefined): Promise<DashboardStats> {
    const response: AxiosResponse<DashboardStats> = await this.api.get('/dashboard/stats');
    return response.data;
  }

  async getCheckpointProgress(): Promise<CheckpointData[]> {
    const response: AxiosResponse<CheckpointData[]> = await this.api.get('/dashboard/checkpoints');
    return response.data;
  }

  // ===== EXECUTIVE DASHBOARD ENDPOINTS =====
  /**
   * Get complete executive dashboard data
   * @param filters Optional filters for stage, payment method, and date range
   * @returns Executive dashboard data with all metrics and charts
   */
  async getExecutiveDashboard(filters: ExecutiveDashboardFilters = {}): Promise<ExecutiveDashboardData> {
    const params = new URLSearchParams();
    
    if (filters.stage) params.append('stage', filters.stage);
    if (filters.payment_with) params.append('payment_with', filters.payment_with);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response: AxiosResponse<ExecutiveDashboardData> = await this.api.get(
      `/executive-dashboard?${params.toString()}`
    );
    return response.data;
  }

  // ===== BATCH ENDPOINTS =====
  async getBatches(filters: BatchFilter = {}): Promise<PaginatedResponse<Batch>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<PaginatedResponse<Batch>> = await this.api.get(
      `/batches?${params.toString()}`
    );
    return response.data;
  }

  async getBatchById(batchId: string): Promise<Batch> {
    const response: AxiosResponse<Batch> = await this.api.get(`/batches/${batchId}`);
    return response.data;
  }

  async uploadBatch(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response: AxiosResponse<UploadResponse> = await this.api.post(
      '/batches/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async preprocessBatch(batchId: string): Promise<PreprocessResult> {
    const response: AxiosResponse<PreprocessResult> = await this.api.post(
      `/batches/${batchId}/preprocess`
    );
    return response.data;
  }

  async downloadCorrectedExcel(batchId: string): Promise<Blob> {
    const response = await this.api.get(`/batches/${batchId}/download-corrected`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // ===== BENEFICIARY ENDPOINTS =====
  async getBeneficiaries(filters: BeneficiaryFilter = {}): Promise<PaginatedResponse<Beneficiary>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response: AxiosResponse<PaginatedResponse<Beneficiary>> = await this.api.get(
      `/beneficiaries?${params.toString()}`
    );
    return response.data;
  }

  async searchBeneficiary(query: string): Promise<Beneficiary[]> {
    const response: AxiosResponse<Beneficiary[]> = await this.api.get(
      `/beneficiaries/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  }

  async updateBeneficiary(id: string, data: Partial<Beneficiary>): Promise<Beneficiary> {
    const response: AxiosResponse<Beneficiary> = await this.api.put(
      `/beneficiaries/${id}`,
      data
    );
    return response.data;
  }

  async getBeneficiaryById(id: string): Promise<Beneficiary> {
    const response: AxiosResponse<Beneficiary> = await this.api.get(`/beneficiaries/${id}`);
    return response.data;
  }

  // ===== RECONCILIATION ENDPOINTS =====
  async uploadBankResponse(batchId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    await this.api.post(`/reconciliation/${batchId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getReconciliation(batchId: string): Promise<ReconciliationData> {
    const response: AxiosResponse<ReconciliationData> = await this.api.get(
      `/reconciliation/${batchId}`
    );
    return response.data;
  }

  async downloadReconciliationReport(batchId: string, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> {
    const response = await this.api.get(
      `/reconciliation/${batchId}/report?format=${format}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  // ===== NOTIFICATION ENDPOINTS =====
  async getNotifications(): Promise<Notification[]> {
    const response: AxiosResponse<Notification[]> = await this.api.get('/notifications');
    return response.data;
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.api.put(`/notifications/${notificationId}/read`);
  }

  async clearNotifications(): Promise<void> {
    await this.api.delete('/notifications');
  }

  // ===== REPORT ENDPOINTS =====
  async generateReport(filters: ReportFilter): Promise<Blob> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await this.api.get(
      `/reports/generate?${params.toString()}`,
      {
        responseType: 'blob',
      }
    );
    return response.data;
  }

  async getDailyReport(batchId?: string): Promise<any> {
    const params = batchId ? `?batchId=${batchId}` : '';
    const response = await this.api.get(`/reports/daily${params}`);
    return response.data;
  }

  async getRejectionReport(batchId?: string): Promise<any> {
    const params = batchId ? `?batchId=${batchId}` : '';
    const response = await this.api.get(`/reports/rejections${params}`);
    return response.data;
  }

  async getDistrictReport(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await this.api.get(`/reports/district?${params.toString()}`);
    return response.data;
  }

  // ===== USER MANAGEMENT ENDPOINTS =====
  async getUsers(filters: any = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const response: AxiosResponse<PaginatedResponse<User>> = await this.api.get(
      `/users?${params.toString()}`
    );
    return response.data;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await this.api.patch(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }

  // ===== SYSTEM ENDPOINTS =====
  async getSystemHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/system/health');
    return response.data;
  }

  async getAuditLogs(page: number = 1, limit: number = 50): Promise<PaginatedResponse<any>> {
    const response = await this.api.get(`/audit-logs?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }


  // ===== DRILL-DOWN ENDPOINTS =====
  
  /**
   * Get district-level drill-down data
   * @returns All districts with aggregate metrics
   */
  async getDistrictDrillDown(): Promise<DrillDownResponse<DistrictData>> {
    const response: AxiosResponse<DrillDownResponse<DistrictData>> = await this.api.get(
      '/api/v1/reports/md-approvals/drill-down/districts'
    );
    return response.data;
  }

  /**
   * Get mandal-level drill-down data for a specific district
   * @param district - District name
   * @returns All mandals in the district with aggregate metrics
   */
  async getMandalDrillDown(district: string): Promise<DrillDownResponse<MandalData>> {
    const encodedDistrict = encodeURIComponent(district);
    const response: AxiosResponse<DrillDownResponse<MandalData>> = await this.api.get(
      `/api/v1/reports/md-approvals/drill-down/districts/${encodedDistrict}/mandals`
    );
    return response.data;
  }

  /**
   * Get village-level drill-down data for a specific district and mandal
   * @param district - District name
   * @param mandal - Mandal name
   * @returns All villages in the mandal with aggregate metrics
   */
  async getVillageDrillDown(
    district: string,
    mandal: string
  ): Promise<DrillDownResponse<VillageData>> {
    const encodedDistrict = encodeURIComponent(district);
    const encodedMandal = encodeURIComponent(mandal);
    const response: AxiosResponse<DrillDownResponse<VillageData>> = await this.api.get(
      `/api/v1/reports/md-approvals/drill-down/districts/${encodedDistrict}/mandals/${encodedMandal}/villages`
    );
    return response.data;
  }

  /**
   * Get beneficiary-level drill-down data for a specific district, mandal, and village
   * @param district - District name
   * @param mandal - Mandal name
   * @param village - Village name
   * @param params - Pagination parameters (page, limit)
   * @returns All beneficiaries in the village with pagination
   */
  async getBeneficiaryDrillDown(
    district: string,
    mandal: string,
    village: string,
    params: PaginationParams = {}
  ): Promise<DrillDownResponse<BeneficiaryData>> {
    const encodedDistrict = encodeURIComponent(district);
    const encodedMandal = encodeURIComponent(mandal);
    const encodedVillage = encodeURIComponent(village);
    
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response: AxiosResponse<DrillDownResponse<BeneficiaryData>> = await this.api.get(
      `/api/v1/reports/md-approvals/drill-down/districts/${encodedDistrict}/mandals/${encodedMandal}/villages/${encodedVillage}/beneficiaries?${queryParams.toString()}`
    );
    return response.data;
  }

}

export const apiService = new ApiService();



// ===== API UTILITIES =====
export const apiUtils = {
  formatError: (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  transformDates: <T extends Record<string, any>>(obj: T): T => {
    const transformed = { ...obj };
    const dateFields = ['createdAt', 'updatedAt', 'publishedAt', 'lastLogin'];

    dateFields.forEach(field => {
      if (field in transformed && transformed[field]) {
        (transformed as any)[field] = new Date(transformed[field]);
      }
    });
    return transformed;
  },

  prepareForApi: <T extends Record<string, any>>(obj: T): T => {
    const prepared = { ...obj };
    Object.keys(prepared).forEach(key => {
      if (prepared[key] instanceof Date) {
        (prepared as any)[key] = prepared[key].toISOString();
      }
    });
    return prepared;
  },

  downloadFile: (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default apiService;