import { useState, useCallback } from 'react';
import payRecordsApiService, {  PayRecord } from '../services/payRecordsApi.service';

interface UseBeneficiaryDetailsReturn {
  records: PayRecord[];
  loading: boolean;
  error: string | null;
  fetchBeneficiaryRecords: (beneficiaryId: string) => Promise<void>;
}

export const useBeneficiaryDetails = (): UseBeneficiaryDetailsReturn => {
  const [records, setRecords] = useState<PayRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBeneficiaryRecords = useCallback(async (beneficiaryId: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await payRecordsApiService.getBeneficiaryRecords(beneficiaryId);
      setRecords(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch beneficiary records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    records,
    loading,
    error,
    fetchBeneficiaryRecords,
  };
};
