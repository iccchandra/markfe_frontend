// src/hooks/useFailureReport.ts
import { useState, useCallback } from 'react';
import {
  failureReportApi,
  FailureReportResponse,
  FailureReportParams
} from '../services/failureReportApi';

interface UseFailureReportReturn {
  data: FailureReportResponse | null;
  loading: boolean;
  error: string | null;
  fetchData: (params?: FailureReportParams) => Promise<void>;
  exportReport: (params?: FailureReportParams) => Promise<void>;
}

export const useFailureReport = (): UseFailureReportReturn => {
  const [data, setData] = useState<FailureReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params?: FailureReportParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await failureReportApi.getFailureReport(params);
      setData(response);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch failure report';
      setError(errorMessage);
      console.error('Error fetching failure report:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReport = useCallback(async (params?: FailureReportParams) => {
    setLoading(true);
    setError(null);

    try {
      const blob = await failureReportApi.exportFailureReport(params);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const startDate = params?.startDate || 'latest';
      const endDate = params?.endDate || 'latest';
      link.download = `Failure_Report_${startDate}_to_${endDate}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to export failure report';
      setError(errorMessage);
      console.error('Error exporting failure report:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    fetchData,
    exportReport
  };
};