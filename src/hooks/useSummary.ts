import { useState, useEffect, useCallback } from 'react';
import payRecordsApiService, {  Summary, FilterParams } from '../services/payRecordsApi.service';

interface UseSummaryReturn {
  summary: Summary | null;
  loading: boolean;
  error: string | null;
  fetchSummary: (filters?: FilterParams) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useSummary = (filters?: FilterParams): UseSummaryReturn => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterParams | undefined>(filters);

  const fetchSummary = useCallback(async (newFilters?: FilterParams) => {
    setLoading(true);
    setError(null);
    if (newFilters) setCurrentFilters(newFilters);

    try {
      const data = await payRecordsApiService.getSummary(newFilters || currentFilters);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch summary');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const refetch = useCallback(async () => {
    await fetchSummary(currentFilters);
  }, [currentFilters, fetchSummary]);

  useEffect(() => {
    fetchSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    fetchSummary,
    refetch,
  };
};