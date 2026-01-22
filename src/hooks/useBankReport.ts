// src/hooks/useBankReport.ts
import { useState, useCallback } from 'react';
import {
  bankReportApi,
  BankReportResponse,
  BankReportParams
} from '../services/bankReportApi';

interface UseBankReportReturn {
  data: BankReportResponse | null;
  loading: boolean;
  error: string | null;
  fetchData: (params?: BankReportParams) => Promise<void>;
  exportReport: (params?: BankReportParams) => Promise<void>;
}

export const useBankReport = (): UseBankReportReturn => {
  const [data, setData] = useState<BankReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params?: BankReportParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await bankReportApi.getBankReport(params);
      setData(response);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch bank report';
      setError(errorMessage);
      console.error('Error fetching bank report:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportReport = useCallback(async (params?: BankReportParams) => {
    setLoading(true);
    setError(null);

    try {
      const blob = await bankReportApi.exportBankReport(params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const startDate = params?.startDate || 'latest';
      const endDate = params?.endDate || 'latest';
      link.download = `Bank_Report_${startDate}_to_${endDate}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to export bank report';
      setError(errorMessage);
      console.error('Error exporting bank report:', err);
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