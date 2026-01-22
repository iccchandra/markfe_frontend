// src/hooks/useReconciliation.ts
// ✅ FIXED: Proper data handling and calculations

import { useState, useEffect, useCallback } from 'react';
import {
  reconciliationApiService,
  ReconciliationBatch,
  ReconciliationDetail,
  ReconciliationFilterDto,
  CreateReconciliationFromBatchDto,
  BankWiseSummary,
  ReasonCodeSummary,
  ReconciliationListResponse,
} from '../services/api/reconciliation.service';

// ============================================================================
// HOOK: useReconciliations - Get list of reconciliation batches
// ============================================================================

interface UseReconciliationsReturn {
  reconciliations: ReconciliationBatch[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  refetch: () => Promise<void>;
  setFilters: (filters: ReconciliationFilterDto) => void;
  setPage: (page: number) => void;
}

export const useReconciliations = (
  initialFilters?: ReconciliationFilterDto
): UseReconciliationsReturn => {
  const [reconciliations, setReconciliations] = useState<ReconciliationBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReconciliationFilterDto>(
    initialFilters || { page: 1, limit: 10 }
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const fetchReconciliations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching reconciliations with filters:', filters);
      
      const response: ReconciliationListResponse =
        await reconciliationApiService.getReconciliations(filters);
      
      console.log('✅ Received reconciliations:', response);
      
      setReconciliations(response.data || []);
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        pages: response.pages || 0,
      });
    } catch (err: any) {
      console.error('❌ Error fetching reconciliations:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch reconciliations');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReconciliations();
  }, [fetchReconciliations]);

  const setPage = (page: number) => {
    setFilters({ ...filters, page });
  };

  return {
    reconciliations,
    loading,
    error,
    pagination,
    refetch: fetchReconciliations,
    setFilters,
    setPage,
  };
};

// ============================================================================
// HOOK: useReconciliationStats - ✅ FIXED: Proper calculations
// ============================================================================

interface ReconciliationStats {
  totalBatches: number;
  completed: number;
  pending: number;
  inProgress: number;
  failed: number;
  totalReconciled: number;
  totalMismatches: number;
  averageMatchRate: number;
  totalAmountReconciled: number;
  totalVariance: number;
}

interface UseReconciliationStatsReturn {
  stats: ReconciliationStats;
  loading: boolean;
  error: string | null;
}

export const useReconciliationStats = (): UseReconciliationStatsReturn => {
  const { reconciliations, loading, error } = useReconciliations({ limit: 1000 });
  const [stats, setStats] = useState<ReconciliationStats>({
    totalBatches: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    failed: 0,
    totalReconciled: 0,
    totalMismatches: 0,
    averageMatchRate: 0,
    totalAmountReconciled: 0,
    totalVariance: 0,
  });

  useEffect(() => {
    if (reconciliations.length > 0) {
      console.log('📊 Calculating stats for', reconciliations.length, 'reconciliations');
      
      const calculatedStats: ReconciliationStats = {
        totalBatches: reconciliations.length,
        completed: reconciliations.filter((b) => b.status === 'COMPLETED').length,
        pending: reconciliations.filter((b) => b.status === 'PENDING').length,
        inProgress: reconciliations.filter((b) => b.status === 'IN_PROGRESS').length,
        failed: reconciliations.filter((b) => b.status === 'FAILED').length,
        
        // ✅ FIX: Use bankPaymentSuccess instead of matchedRecords
        totalReconciled: reconciliations.reduce(
          (sum, b) => sum + (b.bankPaymentSuccess || 0),
          0
        ),
        
        // ✅ FIX: Use bankPaymentFailed for mismatches
        totalMismatches: reconciliations.reduce(
          (sum, b) => sum + (b.bankPaymentFailed || 0),
          0
        ),
        
        // ✅ FIX: Calculate average of actual match rates
        averageMatchRate: reconciliations.length > 0
          ? reconciliations.reduce((sum, b) => {
              // Recalculate match rate if it's 0 but has data
              const actualMatchRate = b.totalBankRecords > 0
                ? ((b.bankPaymentSuccess || 0) / b.totalBankRecords) * 100
                : b.matchRate || 0;
              return sum + actualMatchRate;
            }, 0) / reconciliations.length
          : 0,
        
        totalAmountReconciled: reconciliations.reduce(
          (sum, b) => sum + (b.totalAmountPaid || 0),
          0
        ),
        totalVariance: reconciliations.reduce(
          (sum, b) => sum + Math.abs(b.amountVariance || 0),
          0
        ),
      };
      
      console.log('✅ Calculated stats:', calculatedStats);
      setStats(calculatedStats);
    } else if (!loading) {
      console.log('⚠️  No reconciliations found');
    }
  }, [reconciliations, loading]);

  return {
    stats,
    loading,
    error,
  };
};

// ============================================================================
// HOOK: useReconciliationDetail - Get single reconciliation with full details
// ============================================================================

interface UseReconciliationDetailReturn {
  reconciliation: ReconciliationBatch | null;
  detail: ReconciliationDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useReconciliationDetail = (
  id: string
): UseReconciliationDetailReturn => {
  const [reconciliation, setReconciliation] = useState<ReconciliationBatch | null>(null);
  const [detail, setDetail] = useState<ReconciliationDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching reconciliation detail for:', id);
      
      const data = await reconciliationApiService.getReconciliationDetail(id);
      
      console.log('✅ Received detail:', data);
      
      setDetail(data);
      setReconciliation(data.reconciliation);
    } catch (err: any) {
      console.error('❌ Error fetching detail:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch reconciliation detail');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    reconciliation,
    detail,
    loading,
    error,
    refetch: fetchDetail,
  };
};

// ============================================================================
// HOOK: useCreateReconciliation - Create reconciliation from processed batch
// ============================================================================

interface UseCreateReconciliationReturn {
  createReconciliation: (
    data: CreateReconciliationFromBatchDto
  ) => Promise<ReconciliationBatch | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export const useCreateReconciliation = (): UseCreateReconciliationReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const createReconciliation = async (
    data: CreateReconciliationFromBatchDto
  ): Promise<ReconciliationBatch | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log('🔄 Creating reconciliation:', data);

      const response = await reconciliationApiService.createReconciliationFromBatch(data);
      
      console.log('✅ Reconciliation created:', response);
      
      setSuccess(true);
      return response.reconciliation;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create reconciliation';
      console.error('❌ Error creating reconciliation:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createReconciliation,
    loading,
    error,
    success,
  };
};

// ============================================================================
// HOOK: useBankWiseSummary - Get bank-wise reconciliation summary
// ============================================================================

interface UseBankWiseSummaryReturn {
  summary: BankWiseSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useBankWiseSummary = (
  reconciliationId: string
): UseBankWiseSummaryReturn => {
  const [summary, setSummary] = useState<BankWiseSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!reconciliationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await reconciliationApiService.getBankWiseSummary(reconciliationId);
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bank-wise summary');
      console.error('Error fetching bank-wise summary:', err);
    } finally {
      setLoading(false);
    }
  }, [reconciliationId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
};

// ============================================================================
// HOOK: useReasonCodeSummary - Get failure reason code summary
// ============================================================================

interface UseReasonCodeSummaryReturn {
  summary: ReasonCodeSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useReasonCodeSummary = (
  reconciliationId: string
): UseReasonCodeSummaryReturn => {
  const [summary, setSummary] = useState<ReasonCodeSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!reconciliationId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await reconciliationApiService.getReasonCodeSummary(reconciliationId);
      setSummary(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reason code summary');
      console.error('Error fetching reason code summary:', err);
    } finally {
      setLoading(false);
    }
  }, [reconciliationId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refetch: fetchSummary,
  };
};

// ============================================================================
// HOOK: useExportReconciliation - Export reconciliation to Excel
// ============================================================================

interface UseExportReconciliationReturn {
  exportReconciliation: (id: string, filename?: string) => Promise<void>;
  exporting: boolean;
  error: string | null;
}

export const useExportReconciliation = (): UseExportReconciliationReturn => {
  const [exporting, setExporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const exportReconciliation = async (
    id: string,
    filename?: string
  ): Promise<void> => {
    try {
      setExporting(true);
      setError(null);

      const blob = await reconciliationApiService.exportReconciliation(id);
      const defaultFilename = filename || `Reconciliation_${id}_${Date.now()}.xlsx`;
      
      reconciliationApiService.downloadFile(blob, defaultFilename);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to export reconciliation';
      setError(errorMessage);
      console.error('Error exporting reconciliation:', err);
    } finally {
      setExporting(false);
    }
  };

  return {
    exportReconciliation,
    exporting,
    error,
  };
};

// ============================================================================
// HOOK: useReconciliationFilters - Manage filter state
// ============================================================================

interface UseReconciliationFiltersReturn {
  filters: ReconciliationFilterDto;
  setFilter: <K extends keyof ReconciliationFilterDto>(
    key: K,
    value: ReconciliationFilterDto[K]
  ) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

export const useReconciliationFilters = (
  initialFilters?: ReconciliationFilterDto
): UseReconciliationFiltersReturn => {
  const [filters, setFilters] = useState<ReconciliationFilterDto>(
    initialFilters || { page: 1, limit: 10 }
  );

  const setFilter = <K extends keyof ReconciliationFilterDto>(
    key: K,
    value: ReconciliationFilterDto[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ page: 1, limit: 10 });
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) =>
      key !== 'page' &&
      key !== 'limit' &&
      filters[key as keyof ReconciliationFilterDto] !== undefined &&
      filters[key as keyof ReconciliationFilterDto] !== ''
  ).length;

  return {
    filters,
    setFilter,
    resetFilters,
    activeFilterCount,
  };
};