// pages/allreports/PayRecordsDashboard.tsx

import React, { useState, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { payRecordsApi } from '../../services/payRecordsApi.service';
import type { FilterParams } from '../../services/payRecordsApi.service';

import { useAggregateSummary } from '../../hooks/useAggregateSummary';
import { AggregateSummary } from './AggregateSummary';
import { PayRecordsFilter } from './PayRecordsFilter';

export const PayRecordsDashboard: React.FC = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
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
    fetchAggregateSummary 
  } = useAggregateSummary();

  // Handle filter change
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
  };

  // Apply Filters (Search)
  const handleSearch = () => {
    fetchAggregateSummary({ ...filters, page: 1 });
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
    fetchAggregateSummary(resetFilters);
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      const blob = await payRecordsApi.exportToCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pay-records-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  // Handle Page Change for Aggregate View - Disabled
  const handleAggregatePageChange = (page: number) => {
    // No-op: Aggregate view doesn't refresh on page change
    console.log('Aggregate pagination disabled - showing initial data only');
  };

  // Fetch data on mount
  useEffect(() => {
    if (isInitialLoad) {
      fetchAggregateSummary(filters);
      setIsInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
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
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                <Download size={18} />
                Export CSV
              </button>
              <button
                onClick={() => fetchAggregateSummary(filters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <PayRecordsFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleReset}
        />
      </div>

      {/* Aggregate Summary Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AggregateSummary 
          data={aggregateData} 
          loading={aggregateLoading}
          onPageChange={handleAggregatePageChange}
        />
      </div>
    </div>
  );
};

export default PayRecordsDashboard;