// BeneficiaryFilters.tsx - SIMPLIFIED VERSION

import React from 'react';
import { Search, Filter, X } from 'lucide-react';

interface BeneficiaryFilters {
  stage: string;
  pennyDrop: string;
  bank: string;
  paymentStatus: string;
  searchQuery: string;
}

interface BeneficiaryFiltersComponentProps {
  filters: BeneficiaryFilters;
  onFilterChange: (filters: BeneficiaryFilters) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  uniqueBanks: string[];
  totalCount: number;
  filteredCount: number;
}

export const BeneficiaryFiltersComponent: React.FC<BeneficiaryFiltersComponentProps> = ({
  filters,
  onFilterChange,
  showAdvanced,
  onToggleAdvanced,
  uniqueBanks,
  totalCount,
  filteredCount,
}) => {
  const handleFilterChange = (key: keyof BeneficiaryFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('searchQuery', e.target.value);
  };

  const clearAllFilters = () => {
    onFilterChange({
      stage: 'all',
      pennyDrop: 'all',
      bank: 'all',
      paymentStatus: 'all',
      searchQuery: '',
    });
  };

  const hasActiveFilters = 
    filters.stage !== 'all' ||
    filters.pennyDrop !== 'all' ||
    filters.bank !== 'all' ||
    filters.paymentStatus !== 'all' ||
    filters.searchQuery !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, beneficiary ID, account number, or Aadhaar..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          />
        </div>
        <button
          onClick={onToggleAdvanced}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            showAdvanced
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stage Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Stage
              </label>
              <select
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All Stages</option>
                <option value="BL">BL - Base Layer</option>
                <option value="RL">RL - Roof Level</option>
                <option value="RC">RC - Roof Casting</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Penny Drop Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Verification
              </label>
              <select
                value={filters.pennyDrop}
                onChange={(e) => handleFilterChange('pennyDrop', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="SUCCESS">✓ Verified</option>
                <option value="FAILED">✗ Failed</option>
                <option value="NOT_DONE">⏳ Pending</option>
              </select>
            </div>

            {/* Bank Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank
              </label>
              <select
                value={filters.bank}
                onChange={(e) => handleFilterChange('bank', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All Banks</option>
                {uniqueBanks.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All Status</option>
                <option value="paid">💰 Paid</option>
                <option value="not-paid">⏸️ Not Paid</option>
                <option value="failures">❌ Has Failures</option>
              </select>
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              
              {filters.stage !== 'all' && (
                <FilterTag
                  label={`Stage: ${filters.stage}`}
                  onRemove={() => handleFilterChange('stage', 'all')}
                />
              )}
              
              {filters.pennyDrop !== 'all' && (
                <FilterTag
                  label={`Penny Drop: ${filters.pennyDrop}`}
                  onRemove={() => handleFilterChange('pennyDrop', 'all')}
                />
              )}
              
              {filters.bank !== 'all' && (
                <FilterTag
                  label={`Bank: ${filters.bank}`}
                  onRemove={() => handleFilterChange('bank', 'all')}
                />
              )}
              
              {filters.paymentStatus !== 'all' && (
                <FilterTag
                  label={`Payment: ${filters.paymentStatus}`}
                  onRemove={() => handleFilterChange('paymentStatus', 'all')}
                />
              )}
              
              {filters.searchQuery && (
                <FilterTag
                  label={`Search: "${filters.searchQuery}"`}
                  onRemove={() => handleFilterChange('searchQuery', '')}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          {hasActiveFilters ? (
            <>
              Showing <strong className="text-indigo-600">{filteredCount.toLocaleString()}</strong> of{' '}
              <strong>{totalCount.toLocaleString()}</strong> beneficiaries
            </>
          ) : (
            <>
              Total: <strong className="text-indigo-600">{totalCount.toLocaleString()}</strong> beneficiaries
            </>
          )}
        </p>
      </div>
    </div>
  );
};

// Filter Tag Component
interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, onRemove }) => {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
};

export default BeneficiaryFiltersComponent;