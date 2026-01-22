// src/hooks/useDailyStageReport.ts
import { useState, useCallback } from 'react';
import {
  dailyStageReportApi,
  DailyStageReportResponse,
  DailyStageReportParams
} from '../services/dailyStageReportApi';

interface UseDailyStageReportResult {
  data: DailyStageReportResponse | null;
  loading: boolean;
  error: string | null;
  fetchData: (params?: DailyStageReportParams) => Promise<void>;
}

export const useDailyStageReport = (): UseDailyStageReportResult => {
  const [data, setData] = useState<DailyStageReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params?: DailyStageReportParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dailyStageReportApi.getDailyStageReport(params);
      setData(response);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      console.error('Error fetching daily stage report:', err);
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