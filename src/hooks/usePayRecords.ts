// hooks/usePayRecords.ts

import { useState, useEffect, useCallback } from 'react';
import payRecordsApiService from '../services/payRecordsApi.service';
import type { 
  FilterParams, 
  PayRecord,
  ApiResponse
} from '../services/payRecordsApi.service';

interface UsePayRecordsReturn {
  records: PayRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  loading: boolean;
  error: string | null;
  fetchRecords: (filters: FilterParams) => Promise<void>;
  refetch: () => Promise<void>;
}

export const usePayRecords = (initialFilters: FilterParams = {}): UsePayRecordsReturn => {
  const [records, setRecords] = useState<PayRecord[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterParams>(initialFilters);

  const fetchRecords = useCallback(async (filters: FilterParams) => {
    setLoading(true);
    setError(null);
    setCurrentFilters(filters);

    try {
      const response = await payRecordsApiService.getRecords(filters);
      setRecords(response.data);
      
      // Handle optional pagination
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchRecords(currentFilters);
  }, [currentFilters, fetchRecords]);

  useEffect(() => {
    fetchRecords(initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    records,
    pagination,
    loading,
    error,
    fetchRecords,
    refetch,
  };
};