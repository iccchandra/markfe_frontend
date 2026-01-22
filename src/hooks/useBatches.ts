// src/hooks/useBatches.ts
import { useState, useEffect, useCallback } from 'react';
import batchApiService, {
  BatchType,
  BatchFilterDto,
  CreateBatchDto,
  UpdateBatchDto,
  BatchStatsResponse,
} from '../services/api/batch.service';

interface UseBatchesReturn {
  batches: BatchType[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
  fetchBatches: (filters?: BatchFilterDto) => Promise<void>;
  createBatch: (data: CreateBatchDto) => Promise<BatchType | null>;
  updateBatch: (id: string, data: UpdateBatchDto) => Promise<BatchType | null>;
  activateBatch: (id: string) => Promise<BatchType | null>;
  deleteBatch: (id: string) => Promise<boolean>;
  uploadBatchFile: (file: File, batchType: 'PENNY_DROP' | 'PAYMENT') => Promise<any>;
  exportBatches: (filters?: BatchFilterDto) => Promise<void>;
}

export const useBatches = (initialFilters?: BatchFilterDto): UseBatchesReturn => {
  const [batches, setBatches] = useState<BatchType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pages, setPages] = useState<number>(1);

  const fetchBatches = useCallback(async (filters?: BatchFilterDto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await batchApiService.getBatches(filters);
      setBatches(response.data);
      setTotal(response.total);
      setPage(response.page);
      setPages(response.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch batches');
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBatch = useCallback(async (data: CreateBatchDto): Promise<BatchType | null> => {
    try {
      setLoading(true);
      setError(null);
      const newBatch = await batchApiService.createBatch(data);
      setBatches((prev) => [newBatch, ...prev]);
      setTotal((prev) => prev + 1);
      return newBatch;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create batch');
      console.error('Error creating batch:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBatch = useCallback(async (id: string, data: UpdateBatchDto): Promise<BatchType | null> => {
    try {
      setLoading(true);
      setError(null);
      const updatedBatch = await batchApiService.updateBatch(id, data);
      setBatches((prev) =>
        prev.map((batch) => (batch.id === id ? updatedBatch : batch))
      );
      return updatedBatch;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update batch');
      console.error('Error updating batch:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateBatch = useCallback(async (id: string): Promise<BatchType | null> => {
    try {
      setLoading(true);
      setError(null);
      const activatedBatch = await batchApiService.activateBatch(id);
      setBatches((prev) =>
        prev.map((batch) => (batch.id === id ? activatedBatch : batch))
      );
      return activatedBatch;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate batch');
      console.error('Error activating batch:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBatch = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await batchApiService.deleteBatch(id);
      setBatches((prev) => prev.filter((batch) => batch.id !== id));
      setTotal((prev) => prev - 1);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete batch');
      console.error('Error deleting batch:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadBatchFile = useCallback(async (file: File, batchType: 'PENNY_DROP' | 'PAYMENT'): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const result = await batchApiService.uploadBatchFile(file, batchType);
      // Refresh batches after upload
      await fetchBatches(initialFilters);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload batch file');
      console.error('Error uploading batch file:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBatches, initialFilters]);

  const exportBatches = useCallback(async (filters?: BatchFilterDto): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const blob = await batchApiService.exportBatches(filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `batches_export_${new Date().toISOString()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to export batches');
      console.error('Error exporting batches:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches(initialFilters);
  }, [fetchBatches, initialFilters]);

  return {
    batches,
    loading,
    error,
    total,
    page,
    pages,
    fetchBatches,
    createBatch,
    updateBatch,
    activateBatch,
    deleteBatch,
    uploadBatchFile,
    exportBatches,
  };
};

interface UseBatchDetailReturn {
  batch: BatchType | null;
  stats: BatchStatsResponse | null;
  loading: boolean;
  error: string | null;
  fetchBatch: (id: string) => Promise<void>;
  fetchStats: (id: string) => Promise<void>;
  updateBatch: (data: UpdateBatchDto) => Promise<BatchType | null>;
  activateBatch: () => Promise<BatchType | null>;
}

export const useBatchDetail = (batchId?: string): UseBatchDetailReturn => {
  const [batch, setBatch] = useState<BatchType | null>(null);
  const [stats, setStats] = useState<BatchStatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBatch = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const batchData = await batchApiService.getBatchById(id);
      setBatch(batchData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch batch');
      console.error('Error fetching batch:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await batchApiService.getBatchStats(id);
      setStats(statsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch batch stats');
      console.error('Error fetching batch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBatch = useCallback(async (data: UpdateBatchDto): Promise<BatchType | null> => {
    if (!batch) return null;

    try {
      setLoading(true);
      setError(null);
      const updatedBatch = await batchApiService.updateBatch(batch.id, data);
      setBatch(updatedBatch);
      return updatedBatch;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update batch');
      console.error('Error updating batch:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [batch]);

  const activateBatch = useCallback(async (): Promise<BatchType | null> => {
    if (!batch) return null;

    try {
      setLoading(true);
      setError(null);
      const activatedBatch = await batchApiService.activateBatch(batch.id);
      setBatch(activatedBatch);
      return activatedBatch;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to activate batch');
      console.error('Error activating batch:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [batch]);

  useEffect(() => {
    if (batchId) {
      fetchBatch(batchId);
      fetchStats(batchId);
    }
  }, [batchId, fetchBatch, fetchStats]);

  return {
    batch,
    stats,
    loading,
    error,
    fetchBatch,
    fetchStats,
    updateBatch,
    activateBatch,
  };
};