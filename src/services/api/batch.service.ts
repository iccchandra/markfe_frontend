// src/services/api/batch.service.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'https://kotak-risk-analysis.alliantprojects.com';

export interface BatchType {
  id: string;
  batchId: string;
  batchType: 'PENNY_DROP' | 'PAYMENT';
  workStage?: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  correctedRecords: number;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  amount: number;
  amountPerBeneficiary: number;
  createdBy: string;
  dataQuality: number;
  pennyDropVerified: number;
  pennyDropFailed: number;
  fileName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBatchDto {
  batchId: string;
  batchType: 'PENNY_DROP' | 'PAYMENT';
  totalRecords: number;
  workStage?: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  createdBy: string;
  notes?: string;
}

export interface UpdateBatchDto {
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  validRecords?: number;
  invalidRecords?: number;
  dataQuality?: number;
  notes?: string;
}

export interface BatchFilterDto {
  status?: 'DRAFT' | 'ACTIVE' | 'COMPLETED';
  batchType?: 'PENNY_DROP' | 'PAYMENT';
  workStage?: 'BL' | 'RL' | 'RC' | 'COMPLETED';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface BatchListResponse {
  data: BatchType[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface BatchStatsResponse {
  batch: BatchType;
  stageDistribution: {
    bl: number;
    rl: number;
    rc: number;
    completed: number;
  };
  pennyDropStats: {
    verified: number;
    failed: number;
    pending: number;
  };
  totalBeneficiaries: number;
  dataQuality: number;
  totalPaid: number;
  expectedAmount: number;
  amountVariance: number;
  variancePercentage: number;
  checkpointsEarned: number;
  batchType: string;
  workStage: string;
  amountPerBeneficiary: number;
}

class BatchApiService {
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

  /**
   * Get all batches with optional filters
   */
  async getBatches(filters?: BatchFilterDto): Promise<BatchListResponse> {
    const response = await this.api.get<BatchListResponse>('/batches', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get a single batch by ID
   */
  async getBatchById(id: string): Promise<BatchType> {
    const response = await this.api.get<BatchType>(`/batches/${id}`);
    return response.data;
  }

  /**
   * Get batch statistics
   */
  async getBatchStats(id: string): Promise<BatchStatsResponse> {
    const response = await this.api.get<BatchStatsResponse>(`/batches/${id}/stats`);
    return response.data;
  }

  /**
   * Create a new batch
   */
  async createBatch(data: CreateBatchDto): Promise<BatchType> {
    const response = await this.api.post<BatchType>('/batches', data);
    return response.data;
  }

  /**
   * Update an existing batch
   */
  async updateBatch(id: string, data: UpdateBatchDto): Promise<BatchType> {
    const response = await this.api.put<BatchType>(`/batches/${id}`, data);
    return response.data;
  }

  /**
   * Activate a batch
   */
  async activateBatch(id: string): Promise<BatchType> {
    const response = await this.api.put<BatchType>(`/batches/${id}/activate`);
    return response.data;
  }

  /**
   * Delete a batch
   */
  async deleteBatch(id: string): Promise<void> {
    await this.api.delete(`/batches/${id}`);
  }

  /**
   * Upload batch file
   */
  async uploadBatchFile(file: File, batchType: 'PENNY_DROP' | 'PAYMENT'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('batchType', batchType);

    const response = await this.api.post('/batches/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Export batches to CSV/Excel
   */
  async exportBatches(filters?: BatchFilterDto): Promise<Blob> {
    const response = await this.api.get('/batches/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  }
}

export const batchApiService = new BatchApiService();
export default batchApiService;