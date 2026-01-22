import { useState, useEffect, useCallback } from 'react';
import payRecordsApiService from '../services/payRecordsApi.service';
import type { FilterParams, PaymentKPIs } from '../services/payRecordsApi.service';

interface UsePaymentKPIsReturn {
  kpis: PaymentKPIs | null;
  loading: boolean;
  error: string | null;
  fetchKPIs: (filters?: FilterParams) => Promise<void>;
  refetch: () => Promise<void>;
}

export const usePaymentKPIs = (initialFilters?: FilterParams): UsePaymentKPIsReturn => {
  const [kpis, setKPIs] = useState<PaymentKPIs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterParams | undefined>(initialFilters);

  const fetchKPIs = useCallback(async (filters?: FilterParams) => {
    setLoading(true);
    setError(null);
    if (filters) setCurrentFilters(filters);

    try {
      const data = await payRecordsApiService.getPaymentKPIs(filters || currentFilters);
      setKPIs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPIs');
      setKPIs(null);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const refetch = useCallback(async () => {
    await fetchKPIs(currentFilters);
  }, [currentFilters, fetchKPIs]);

  useEffect(() => {
    fetchKPIs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    kpis,
    loading,
    error,
    fetchKPIs,
    refetch,
  };
};