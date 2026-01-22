import { useState, useEffect, useCallback } from 'react';
import payRecordsApiService, { 
  StageCombination 
} from '../services/payRecordsApi.service';

interface UseStageCombinationsReturn {
  combinations: StageCombination[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useStageCombinations = (): UseStageCombinationsReturn => {
  const [combinations, setCombinations] = useState<StageCombination[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCombinations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await payRecordsApiService.getStageCombinations();
      setCombinations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stage combinations');
      setCombinations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCombinations();
  }, [fetchCombinations]);

  return {
    combinations,
    loading,
    error,
    refetch: fetchCombinations,
  };
};