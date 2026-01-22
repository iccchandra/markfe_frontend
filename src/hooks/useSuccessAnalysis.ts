// src/hooks/useSuccessAnalysis.ts
import { useState, useCallback } from 'react';
import {
  successAnalysisApi,
  SuccessAnalysisResponse,
  SuccessAnalysisParams
} from '../services/successAnalysisApi';

interface UseSuccessAnalysisReturn {
  data: SuccessAnalysisResponse | null;
  loading: boolean;
  error: string | null;
  fetchData: (params?: SuccessAnalysisParams) => Promise<void>;
}

export const useSuccessAnalysis = (): UseSuccessAnalysisReturn => {
  const [data, setData] = useState<SuccessAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (params?: SuccessAnalysisParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await successAnalysisApi.getSuccessAnalysis(params);
      setData(response);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch success analysis';
      setError(errorMessage);
      console.error('Error fetching success analysis:', err);
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