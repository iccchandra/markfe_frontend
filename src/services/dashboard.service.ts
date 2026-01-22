// ============================================
// services/dashboard.service.ts
// ============================================
// Complete Dashboard Service with API calls
// Place this file in: src/services/dashboard.service.ts

import { DashboardStats } from '../types';
import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================
// TypeScript Interfaces
// ============================================

export interface PaymentTrendItem {
  day: string;
  sent: number;
  confirmed: number;
  rejected: number;
}

export interface RejectionBreakdownItem {
  name: string;
  value: number;
  color: string;
  code: string;
}

export interface StageProgressionItem {
  stage: string;
  count: number;
  amount: number;
  percentage: number;
  paymentsComplete: number;
}

// ============================================
// Dashboard Service Class
// ============================================

class DashboardService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://kotak-risk-analysis.alliantprojects.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth token to all requests
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          // Uncomment to redirect to login
          // window.location.href = '/login';
        }

        // Handle network errors
        if (!error.response) {
          console.error('Network error - please check your connection');
        }

        return Promise.reject(error);
      }
    );
  }

  // ============================================
  // Dashboard API Methods
  // ============================================

  /**
   * Get dashboard statistics
   * @param reconciliationId - Optional filter by reconciliation ID
   * @returns Promise<DashboardStats>
   */
  async getDashboardStats(reconciliationId?: string): Promise<DashboardStats> {
    try {
      const params = reconciliationId ? { reconciliationId } : {};
      const response = await this.api.get('/dashboard/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get payment trend data
   * @param days - Number of days to fetch (default: 7, max: 365)
   * @param reconciliationId - Optional filter by reconciliation ID
   * @returns Promise<PaymentTrendItem[]>
   */
  async getPaymentTrend(
    days: number = 7,
    reconciliationId?: string
  ): Promise<PaymentTrendItem[]> {
    try {
      const params: any = { days };
      if (reconciliationId) {
        params.reconciliationId = reconciliationId;
      }
      const response = await this.api.get('/dashboard/payment-trend', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment trend:', error);
      throw error;
    }
  }

  /**
   * Get rejection breakdown data
   * @param reconciliationId - Optional filter by reconciliation ID
   * @returns Promise<RejectionBreakdownItem[]>
   */
  async getRejectionBreakdown(
    reconciliationId?: string
  ): Promise<RejectionBreakdownItem[]> {
    try {
      const params = reconciliationId ? { reconciliationId } : {};
      const response = await this.api.get('/dashboard/rejection-breakdown', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching rejection breakdown:', error);
      throw error;
    }
  }

  /**
   * Fetch all dashboard data in parallel
   * @param reconciliationId - Optional filter by reconciliation ID
   * @param trendDays - Number of days for trend data
   * @returns Promise with all dashboard data
   */
  async fetchAllDashboardData(reconciliationId?: string, trendDays: number = 7) {
    try {
      const [stats, trend, rejections] = await Promise.all([
        this.getDashboardStats(reconciliationId),
        this.getPaymentTrend(trendDays, reconciliationId),
        this.getRejectionBreakdown(reconciliationId),
      ]);

      return {
        stats,
        trend,
        rejections,
      };
    } catch (error) {
      console.error('Error fetching all dashboard data:', error);
      throw error;
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Set authentication token
   * @param token - JWT token
   */
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    localStorage.removeItem('authToken');
  }

  /**
   * Check if user is authenticated
   * @returns boolean
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  /**
   * Get base API URL
   * @returns string
   */
  getBaseURL(): string {
    return this.api.defaults.baseURL || '';
  }

  // ============================================
  // Generic API Methods (for future use)
  // ============================================

  /**
   * Generic GET request
   * @param url - Endpoint URL
   * @param params - Query parameters
   */
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  /**
   * Generic POST request
   * @param url - Endpoint URL
   * @param data - Request body
   */
  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post(url, data);
    return response.data;
  }

  /**
   * Generic PUT request
   * @param url - Endpoint URL
   * @param data - Request body
   */
  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put(url, data);
    return response.data;
  }

  /**
   * Generic DELETE request
   * @param url - Endpoint URL
   */
  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete(url);
    return response.data;
  }
}

// ============================================
// Export singleton instance
// ============================================

const dashboardService = new DashboardService();
export default dashboardService;

// Also export the class for testing purposes
export { DashboardService };

// ============================================
// Usage Examples
// ============================================

/*
// Import the service
import dashboardService from '@/services/dashboard.service';
import { PaymentTrendItem, RejectionBreakdownItem } from '@/services/dashboard.service';

// 1. Get dashboard stats
const stats = await dashboardService.getDashboardStats();

// 2. Get dashboard stats for specific reconciliation
const stats = await dashboardService.getDashboardStats('recon-123');

// 3. Get payment trend for last 30 days
const trend = await dashboardService.getPaymentTrend(30);

// 4. Get rejection breakdown
const rejections = await dashboardService.getRejectionBreakdown();

// 5. Fetch all data at once
const { stats, trend, rejections } = await dashboardService.fetchAllDashboardData();

// 6. Fetch all data with custom parameters
const data = await dashboardService.fetchAllDashboardData('recon-123', 14);

// 7. Authentication utilities
dashboardService.setAuthToken('your-jwt-token');
const isLoggedIn = dashboardService.isAuthenticated();
dashboardService.clearAuthToken();

// 8. Using in React component
const fetchData = async () => {
  try {
    const [statsData, trendData, rejectionData] = await Promise.all([
      dashboardService.getDashboardStats(),
      dashboardService.getPaymentTrend(7),
      dashboardService.getRejectionBreakdown(),
    ]);
    
    setStats(statsData);
    setPaymentTrend(trendData);
    setRejectionData(rejectionData);
  } catch (error) {
    console.error('Error:', error);
  }
};
*/