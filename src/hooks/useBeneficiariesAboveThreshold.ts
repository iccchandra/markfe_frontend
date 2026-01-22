import { useState, useCallback } from 'react';
import payRecordsApiService, { 
  BeneficiaryAboveThreshold 
} from '../services/payRecordsApi.service';

interface UseBeneficiariesAboveThresholdReturn {
  beneficiaries: BeneficiaryAboveThreshold[];
  loading: boolean;
  error: string | null;
  fetchBeneficiaries: (threshold?: number) => Promise<void>;
}

export const useBeneficiariesAboveThreshold = (): UseBeneficiariesAboveThresholdReturn => {
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryAboveThreshold[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBeneficiaries = useCallback(async (threshold: number = 20000000) => {
    setLoading(true);
    setError(null);

    try {
      const data = await payRecordsApiService.getBeneficiariesAboveThreshold(threshold);
      setBeneficiaries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch beneficiaries');
      setBeneficiaries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    beneficiaries,
    loading,
    error,
    fetchBeneficiaries,
  };
};