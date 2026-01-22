// src/hooks/useConsolidatedReport.ts
import { useState, useCallback } from 'react';
import {
  consolidatedReportApi,
  ConsolidatedReportResponse,
  ConsolidatedReportParams
} from '../services/consolidatedReportApi';

interface UseConsolidatedReportResult {
  data: ConsolidatedReportResponse | null;
  loading: boolean;
  error: string | null;
  fetchData: (params?: ConsolidatedReportParams) => Promise<void>;
}

export const useConsolidatedReport = (): UseConsolidatedReportResult => {
  const [data, setData] = useState<ConsolidatedReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params?: ConsolidatedReportParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await consolidatedReportApi.getConsolidatedReport(params);
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      console.error('Error fetching consolidated report:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData
  };
};