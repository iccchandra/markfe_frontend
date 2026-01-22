// src/hooks/useFailedTransactions.ts
import { useState, useCallback } from 'react';
import {
  failedTransactionsApi,
  FailedTransactionsResponse,
  FailedTransactionsParams
} from '../services/failedTransactionsApi';

interface UseFailedTransactionsResult {
  data: FailedTransactionsResponse | null;
  loading: boolean;
  error: string | null;
  fetchData: (params: FailedTransactionsParams) => Promise<void>;
  exportData: (params: FailedTransactionsParams) => Promise<void>;
}

export const useFailedTransactions = (): UseFailedTransactionsResult => {
  const [data, setData] = useState<FailedTransactionsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params: FailedTransactionsParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await failedTransactionsApi.getFailedTransactions(params);
      setData(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching failed transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (params: FailedTransactionsParams) => {
    try {
      setError(null);
      const blob = await failedTransactionsApi.exportFailedTransactions(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Failed_Transactions_${params.date}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to export data';
      setError(errorMessage);
      console.error('Error exporting failed transactions:', err);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    exportData
  };
};