// src/hooks/useApbsFailureReport.ts

import { ApbsFailureReportResponse, ApbsFailureReportQuery, apbsFailureReportApi, FailedBeneficiariesListResponse } from '..//services/apbs-failure-report.api';
import { useState, useEffect, useCallback, useRef } from 'react';


interface UseApbsFailureReportResult {
  data: ApbsFailureReportResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useApbsFailureReport = (
  params: ApbsFailureReportQuery
): UseApbsFailureReportResult => {
  const [data, setData] = useState<ApbsFailureReportResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Use ref to track if we're already fetching
  const fetchingRef = useRef(false);

  const fetchReport = useCallback(async () => {
    // ✅ Prevent multiple simultaneous calls
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      const response = await apbsFailureReportApi.getFailureReport(params);
      setData(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch report');
      console.error('Error fetching APBS failure report:', err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [
    params.startDate,
    params.endDate,
    params.stage,
    params.page,
    params.limit,
  ]); // ✅ Only depend on primitive values, not the entire object

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, loading, error, refetch: fetchReport };
};

interface UseFailedBeneficiariesResult {
  data: FailedBeneficiariesListResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}



export const useFailedBeneficiaries = (
  params: ApbsFailureReportQuery
): UseFailedBeneficiariesResult => {
  const [data, setData] = useState<FailedBeneficiariesListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Use ref to track if we're already fetching
  const fetchingRef = useRef(false);

  const fetchBeneficiaries = useCallback(async () => {
    // ✅ Prevent multiple simultaneous calls
    if (fetchingRef.current) return;

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      const response = await apbsFailureReportApi.getFailedBeneficiaries(params);
      setData(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch beneficiaries');
      console.error('Error fetching failed beneficiaries:', err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [
    params.startDate,
    params.endDate,
    params.stage,
    params.page,
    params.limit,
  ]); // ✅ Only depend on primitive values

  useEffect(() => {
    fetchBeneficiaries();
  }, [fetchBeneficiaries]);

  return { data, loading, error, refetch: fetchBeneficiaries };
};

// Hook for date range management
export const useDateRange = (defaultDays: number = 30) => {
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - defaultDays);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const setLast7Days = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const setLast30Days = useCallback(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  const setCurrentMonth = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  }, []);

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setLast7Days,
    setLast30Days,
    setCurrentMonth,
  };
};