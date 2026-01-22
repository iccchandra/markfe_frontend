// src/hooks/useReports.ts
import { useState, useCallback, useEffect } from 'react';
import reportsApi, { 
  ReportFormat, 
  ReportType, 
  GenerateReportRequest,
  CustomReportRequest,
  ScheduleReportRequest,
  DailyBatchSummary,
  WeeklyDisbursement,
  Schedule,
  ReportHistory
} from '../services/reportsApi';

// ============================================================
// GENERIC REPORT HOOK
// ============================================================

export interface UseReportState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  generate: (params?: any) => Promise<void>;
  download: (format: ReportFormat, filename: string) => Promise<void>;
  reset: () => void;
}

export function useReport<T = any>(): UseReportState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  const generate = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.generateReport(params);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const download = useCallback(async (format: ReportFormat, filename: string) => {
    try {
      setLoading(true);
      setError(null);
      // Implementation depends on specific report type
      // This is a placeholder
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to download report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, generate, download, reset };
}

// ============================================================
// DAILY BATCH SUMMARY HOOK
// ============================================================

export function useDailyBatchSummary() {
  const [data, setData] = useState<DailyBatchSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (date?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.getDailyBatchSummary(date, ReportFormat.JSON);
      setData(result as DailyBatchSummary);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch daily summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const download = useCallback(async (format: ReportFormat, date?: string) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await reportsApi.getDailyBatchSummary(date, format) as Blob;
      const filename = `daily-batch-summary-${date || 'today'}.${format.toLowerCase()}`;
      reportsApi.downloadFile(blob, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to download report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchSummary, download };
}

// ============================================================
// WEEKLY DISBURSEMENT HOOK
// ============================================================

export function useWeeklyDisbursement() {
  const [data, setData] = useState<WeeklyDisbursement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisbursement = useCallback(async (weekStart?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.getWeeklyDisbursement(weekStart, ReportFormat.JSON);
      setData(result as WeeklyDisbursement);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch disbursement data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const download = useCallback(async (format: ReportFormat, weekStart?: string) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await reportsApi.getWeeklyDisbursement(weekStart, format) as Blob;
      const filename = `weekly-disbursement-${weekStart || 'current'}.${format.toLowerCase()}`;
      reportsApi.downloadFile(blob, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to download report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchDisbursement, download };
}

// ============================================================
// MONTHLY RECONCILIATION HOOK
// ============================================================

export function useMonthlyReconciliation() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReconciliation = useCallback(async (month?: string, year?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.getMonthlyReconciliation(month, year, ReportFormat.JSON);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch reconciliation data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const download = useCallback(async (format: ReportFormat, month?: string, year?: string) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await reportsApi.getMonthlyReconciliation(month, year, format) as Blob;
      const filename = `monthly-reconciliation-${month}-${year}.${format.toLowerCase()}`;
      reportsApi.downloadFile(blob, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to download report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchReconciliation, download };
}

// ============================================================
// PENNY DROP ANALYSIS HOOK
// ============================================================

export function usePennyDropAnalysis() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.getPennyDropAnalysis(startDate, endDate, ReportFormat.JSON);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch penny drop analysis');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const download = useCallback(async (format: ReportFormat, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await reportsApi.getPennyDropAnalysis(startDate, endDate, format) as Blob;
      const filename = `penny-drop-analysis-${startDate}-to-${endDate}.${format.toLowerCase()}`;
      reportsApi.downloadFile(blob, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to download report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchAnalysis, download };
}

// ============================================================
// DATA QUALITY TRENDS HOOK
// ============================================================

export function useDataQualityTrends() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.getDataQualityTrends(startDate, endDate, ReportFormat.JSON);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data quality trends');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const download = useCallback(async (format: ReportFormat, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await reportsApi.getDataQualityTrends(startDate, endDate, format) as Blob;
      const filename = `data-quality-trends-${startDate}-to-${endDate}.${format.toLowerCase()}`;
      reportsApi.downloadFile(blob, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to download report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchTrends, download };
}

// ============================================================
// CUSTOM REPORTS HOOK
// ============================================================

export function useCustomReport() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableFields, setAvailableFields] = useState<any>(null);

  useEffect(() => {
    const loadFields = async () => {
      try {
        const fields = await reportsApi.getAvailableFields();
        setAvailableFields(fields);
      } catch (err) {
        console.error('Failed to load available fields', err);
      }
    };
    loadFields();
  }, []);

  const generate = useCallback(async (request: CustomReportRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.generateCustomReport(request);
      setData(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate custom report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTemplate = useCallback(async (request: CustomReportRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.saveCustomReportTemplate(request);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, availableFields, generate, saveTemplate };
}

// ============================================================
// TEMPLATES HOOK
// ============================================================

export function useReportTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.getCustomReportTemplates();
      setTemplates(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch templates');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateFromTemplate = useCallback(async (
    templateId: string,
    params: { startDate?: string; endDate?: string; format?: ReportFormat }
  ) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.generateFromTemplate(templateId, params);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate from template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { templates, loading, error, fetchTemplates, generateFromTemplate };
}

// ============================================================
// SCHEDULED REPORTS HOOK
// ============================================================

export function useScheduledReports() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.getScheduledReports();
      setSchedules(result);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch schedules');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSchedule = useCallback(async (request: ScheduleReportRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.scheduleReport(request);
      setSchedules(prev => [...prev, result]);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const pauseSchedule = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.pauseSchedule(id);
      setSchedules(prev => prev.map(s => s.id === id ? result : s));
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to pause schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resumeSchedule = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await reportsApi.resumeSchedule(id);
      setSchedules(prev => prev.map(s => s.id === id ? result : s));
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to resume schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await reportsApi.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  return { 
    schedules, 
    loading, 
    error, 
    fetchSchedules, 
    createSchedule, 
    pauseSchedule, 
    resumeSchedule, 
    deleteSchedule 
  };
}

// ============================================================
// REPORT HISTORY HOOK
// ============================================================

export function useReportHistory(limit: number = 50) {
  const [reports, setReports] = useState<ReportHistory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const fetchHistory = useCallback(async (newOffset?: number) => {
    try {
      setLoading(true);
      setError(null);
      const currentOffset = newOffset !== undefined ? newOffset : offset;
      const result = await reportsApi.getReportHistory(limit, currentOffset);
      setReports(result.reports);
      setTotal(result.total);
      setOffset(currentOffset);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch report history');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  const downloadReport = useCallback(async (reportId: string, filename: string) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await reportsApi.downloadReport(reportId);
      reportsApi.downloadFile(blob, filename);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to download report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const nextPage = useCallback(() => {
    if (offset + limit < total) {
      fetchHistory(offset + limit);
    }
  }, [offset, limit, total, fetchHistory]);

  const prevPage = useCallback(() => {
    if (offset > 0) {
      fetchHistory(Math.max(0, offset - limit));
    }
  }, [offset, limit, fetchHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { 
    reports, 
    total, 
    loading, 
    error, 
    offset,
    limit,
    fetchHistory, 
    downloadReport,
    nextPage,
    prevPage,
    hasNextPage: offset + limit < total,
    hasPrevPage: offset > 0
  };
}