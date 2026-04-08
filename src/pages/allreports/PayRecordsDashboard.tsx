// pages/allreports/PayRecordsDashboard.tsx

import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, AlertCircle } from 'lucide-react';
import { payRecordsApi } from '../../services/payRecordsApi.service';
import type { FilterParams } from '../../services/payRecordsApi.service';

import { useAggregateSummary } from '../../hooks/useAggregateSummary';
import { AggregateSummary } from './AggregateSummary';
import { PayRecordsFilter } from './PayRecordsFilter';

export const PayRecordsDashboard: React.FC = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterParams>({
    page: 1,
    limit: 50,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    dateField: 'bankProcessedDate',
  });

  const { 
    data: aggregateData, 
    loading: aggregateLoading, 
    error: aggregateError,
    fetchAggregateSummary 
  } = useAggregateSummary();

  // Handle filter change
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };

  // Apply Filters (Search)
  const handleSearch = () => {
    setError(null);
    // Reset to page 1 when searching with new filters
    const searchFilters = { ...filters, page: 1 };
    setFilters(searchFilters);
    fetchAggregateSummary(searchFilters);
  };

  // Reset Filters
  const handleReset = () => {
    const resetFilters: FilterParams = {
      page: 1,
      limit: 50,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      dateField: 'bankProcessedDate',
    };
    
    setFilters(resetFilters);
    setError(null);
    fetchAggregateSummary(resetFilters);
  };

  // Refresh current view
  const handleRefresh = () => {
    setError(null);
    fetchAggregateSummary(filters);
  };

  // Handle Page Change for Aggregate View
  const handleAggregatePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchAggregateSummary(newFilters);
  };

  // Handle Limit Change (rows per page)
  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 }; // Reset to page 1 when limit changes
    setFilters(newFilters);
    fetchAggregateSummary(newFilters);
  };

  // Export to CSV (exports all data matching current filters, not just current page)
  const handleExport = async () => {
    setExportLoading(true);
    setError(null);
    
    try {
      // Export with current filters but without pagination limits
      const exportFilters = { ...filters };
      delete exportFilters.page;
      delete exportFilters.limit;
      
      const blob = await payRecordsApi.exportToCSV(exportFilters);
      
      if (!blob || blob.size === 0) {
        throw new Error('Export returned empty file');
      }
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pay-records-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError(error instanceof Error ? error.message : 'Failed to export CSV. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    if (isInitialLoad) {
      fetchAggregateSummary(filters);
      setIsInitialLoad(false);
    }
  }, []); // Intentionally empty - only run on mount

  // Clear error when filters change
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [filters]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Records Report</h1>
              <p className="text-sm text-gray-500 mt-1">
                Comprehensive payment tracking and analysis system
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                disabled={exportLoading || aggregateLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} className={exportLoading ? 'animate-bounce' : ''} />
                {exportLoading ? 'Exporting...' : 'Export CSV'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={aggregateLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={18} className={aggregateLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {(error || aggregateError) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error || aggregateError}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PayRecordsFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleReset}
          disabled={aggregateLoading}
        />
      </div>

      {/* Aggregate Summary Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AggregateSummary 
          data={aggregateData} 
          loading={aggregateLoading}
          onPageChange={handleAggregatePageChange}
          onLimitChange={handleLimitChange}
          currentPage={filters.page}
          currentLimit={filters.limit}
        />
      </div>
    </div>
  );
};

export default PayRecordsDashboard;