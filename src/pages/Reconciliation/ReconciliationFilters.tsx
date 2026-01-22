// ReconciliationFilters.tsx - Reusable filter component for reconciliation records

import React from 'react';
import { X } from 'lucide-react';
import type { ReconciliationFilters as IReconciliationFilters } from '../../types';

interface ReconciliationFiltersProps {
  filters: IReconciliationFilters;
  onChange: (filters: IReconciliationFilters) => void;
  showReset?: boolean;
}

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, onRemove }) => {
  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-indigo-100 border border-indigo-300 rounded-full text-xs font-medium text-indigo-700">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:text-indigo-900 transition-colors"
        title="Remove filter"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

export const ReconciliationFilters: React.FC<ReconciliationFiltersProps> = ({
  filters,
  onChange,
  showReset = true
}) => {
  const handleFilterChange = (key: keyof IReconciliationFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onChange({
      matchStatus: 'all',
      paymentStatus: 'all',
      pennyDropStatus: 'all',
      stage: 'all',
      hasIssues: 'all',
      searchQuery: ''
    });
  };

  const activeFilterCount = Object.values(filters).filter(
    val => val !== 'all' && val !== ''
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Filter Records</h3>
        {showReset && activeFilterCount > 0 && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <X className="w-4 h-4" />
            Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Match Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Match Status
          </label>
          <select
            value={filters.matchStatus}
            onChange={(e) => handleFilterChange('matchStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="MATCHED">Matched</option>
            <option value="MISMATCHED">Mismatched</option>
            <option value="PENNY_DROP_MISMATCH">Name Mismatch</option>
            <option value="MISSING_IN_BANK">Missing (Bank)</option>
            <option value="MISSING_IN_UPLOAD">Missing (Upload)</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status
          </label>
          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="SUCCESS">Successful</option>
            <option value="FAILED">Failed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        {/* Penny Drop Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Penny Drop Status
          </label>
          <select
            value={filters.pennyDropStatus}
            onChange={(e) => handleFilterChange('pennyDropStatus', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="SUCCESS">Successful</option>
            <option value="FAILED">Failed</option>
            <option value="NOT_DONE">Not Done</option>
          </select>
        </div>

        {/* Has Issues Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issues
          </label>
          <select
            value={filters.hasIssues}
            onChange={(e) => handleFilterChange('hasIssues', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Records</option>
            <option value="true">With Issues</option>
            <option value="false">No Issues</option>
          </select>
        </div>

        {/* Stage Filter (optional for detail view) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beneficiary Stage
          </label>
          <select
            value={filters.stage}
            onChange={(e) => handleFilterChange('stage', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Stages</option>
            <option value="BL">BL - Beneficiary List</option>
            <option value="RL">RL - Release List</option>
            <option value="RC">RC - Received Confirmation</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.matchStatus !== 'all' && (
              <FilterTag
                label={`Match: ${filters.matchStatus}`}
                onRemove={() => handleFilterChange('matchStatus', 'all')}
              />
            )}
            {filters.paymentStatus !== 'all' && (
              <FilterTag
                label={`Payment: ${filters.paymentStatus}`}
                onRemove={() => handleFilterChange('paymentStatus', 'all')}
              />
            )}
            {filters.pennyDropStatus !== 'all' && (
              <FilterTag
                label={`PennyDrop: ${filters.pennyDropStatus}`}
                onRemove={() => handleFilterChange('pennyDropStatus', 'all')}
              />
            )}
            {filters.hasIssues !== 'all' && (
              <FilterTag
                label={`Issues: ${filters.hasIssues === 'true' ? 'Yes' : 'No'}`}
                onRemove={() => handleFilterChange('hasIssues', 'all')}
              />
            )}
            {filters.stage !== 'all' && (
              <FilterTag
                label={`Stage: ${filters.stage}`}
                onRemove={() => handleFilterChange('stage', 'all')}
              />
            )}
            {filters.searchQuery !== '' && (
              <FilterTag
                label={`Search: "${filters.searchQuery}"`}
                onRemove={() => handleFilterChange('searchQuery', '')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconciliationFilters;