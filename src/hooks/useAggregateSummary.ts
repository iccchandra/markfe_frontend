import { useState, useCallback } from 'react';
import payRecordsApiService from '../services/payRecordsApi.service';
import type { 
  FilterParams, 
  AggregateSummaryResponse 
} from '../services/payRecordsApi.service';

interface UseAggregateSummaryReturn {
  data: AggregateSummaryResponse | null;
  loading: boolean;
  error: string | null;
  fetchAggregateSummary: (filters: FilterParams) => Promise<void>;
}

export const useAggregateSummary = (): UseAggregateSummaryReturn => {
  const [data, setData] = useState<AggregateSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAggregateSummary = useCallback(async (filters: FilterParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await payRecordsApiService.getAggregateSummary(filters);
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch aggregate summary');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchAggregateSummary,
  };
};