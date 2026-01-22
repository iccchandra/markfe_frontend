
import { useState, useCallback } from 'react';
import payRecordsApiService, {  FilterParams } from '../services/payRecordsApi.service';

interface UseExportCSVReturn {
  loading: boolean;
  error: string | null;
  exportToCSV: (filters: FilterParams, filename?: string) => Promise<void>;
}

export const useExportCSV = (): UseExportCSVReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToCSV = useCallback(async (filters: FilterParams, filename = 'pay-records.csv') => {
    setLoading(true);
    setError(null);

    try {
      const blob = await payRecordsApiService.exportToCSV(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to export CSV');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    exportToCSV,
  };
};
