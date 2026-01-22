import { useState, useEffect, useCallback } from 'react';
import payRecordsApiService, { 
  PennyDropStatusBreakdown 
} from '../services/payRecordsApi.service';

interface UsePennyDropStatusReturn {
  breakdown: PennyDropStatusBreakdown[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePennyDropStatus = (): UsePennyDropStatusReturn => {
  const [breakdown, setBreakdown] = useState<PennyDropStatusBreakdown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBreakdown = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await payRecordsApiService.getPennyDropStatusBreakdown();
      setBreakdown(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch penny drop status');
      setBreakdown([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBreakdown();
  }, [fetchBreakdown]);

  return {
    breakdown,
    loading,
    error,
    refetch: fetchBreakdown,
  };
};