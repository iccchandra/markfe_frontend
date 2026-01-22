// IntegratedBeneficiaryFilters.tsx - UPDATED FOR NEW BACKEND
// ✅ Fixed payment mode filter logic (APBS/BANK/IOB)
// ✅ Proper penny drop filtering
// ✅ Accurate search across both systems
// ✅ Stage filtering for combined data

import React from 'react';
import { Search, Filter, X, CreditCard, Building2, RefreshCw } from 'lucide-react';

interface BeneficiaryFilters {
  stage: string;
  pennyDrop: string;
  paymentMode: string;
  paymentStatus: string;
  searchQuery: string;
}

interface IntegratedBeneficiaryFiltersProps {
  filters: BeneficiaryFilters;
  onFilterChange: (filters: BeneficiaryFilters) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  totalCount: number;
  filteredCount: number;
}

export const IntegratedBeneficiaryFilters: React.FC<IntegratedBeneficiaryFiltersProps> = ({
  filters,
  onFilterChange,
  showAdvanced,
  onToggleAdvanced,
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
      paymentMode: 'all',
      paymentStatus: 'all',
      searchQuery: '',
    });
  };

  const hasActiveFilters = 
    filters.stage !== 'all' ||
    filters.pennyDrop !== 'all' ||
    filters.paymentMode !== 'all' ||
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
            {/* Payment Mode Filter - Most Important */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Mode
              </label>
              <select
                value={filters.paymentMode}
                onChange={(e) => handleFilterChange('paymentMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                <option value="all">All Modes</option>
                <option value="APBS">🏦 APBS Only</option>
                <option value="BANK">🏛️ Bank Transfer Only</option>
                <option value="IOB">🔄 IOB Only</option>
              </select>
            </div>

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

            {/* Penny Drop Filter (APBS Only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Verification
                <span className="text-xs text-blue-600 ml-1">(APBS)</span>
              </label>
              <select
                value={filters.pennyDrop}
                onChange={(e) => handleFilterChange('pennyDrop', e.target.value)}
                disabled={filters.paymentMode === 'BANK'} // Disable for bank-only
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
                  filters.paymentMode === 'BANK' ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                <option value="all">All Status</option>
                <option value="SUCCESS">✓ Verified</option>
                <option value="FAILED">✗ Failed</option>
                <option value="NOT_DONE">⏳ Not Done</option>
              </select>
              {filters.paymentMode === 'BANK' && (
                <p className="text-xs text-gray-500 mt-1">N/A for bank transfers</p>
              )}
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
                <option value="paid">💰 Fully Paid</option>
                <option value="partial">🔶 Partially Paid</option>
                <option value="pending">⏸️ Pending Payment</option>
                <option value="failures">❌ Has Failures</option>
              </select>
            </div>
          </div>

          {/* Active Filter Tags */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              
              {filters.paymentMode !== 'all' && (
                <FilterTag
                  label={`Mode: ${getPaymentModeLabel(filters.paymentMode)}`}
                  onRemove={() => handleFilterChange('paymentMode', 'all')}
                  icon={getPaymentModeIcon(filters.paymentMode)}
                />
              )}
              
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
              
              {filters.paymentStatus !== 'all' && (
                <FilterTag
                  label={`Payment: ${filters.paymentStatus}`}
                  onRemove={() => handleFilterChange('paymentStatus', 'all')}
                />
              )}
              
              {filters.searchQuery && (
                <FilterTag
                  label={`Search: "${filters.searchQuery.substring(0, 20)}${filters.searchQuery.length > 20 ? '...' : ''}"`}
                  onRemove={() => handleFilterChange('searchQuery', '')}
                />
              )}
            </div>
          )}

          {/* Payment Mode Info Box */}
          {filters.paymentMode !== 'all' && (
            <div className={`mt-4 p-3 rounded-lg border ${getPaymentModeInfoStyle(filters.paymentMode)}`}>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{getPaymentModeIcon(filters.paymentMode)}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {getPaymentModeLabel(filters.paymentMode)} Mode Selected
                  </p>
                  <p className="text-xs mt-1">
                    {getPaymentModeDescription(filters.paymentMode)}
                  </p>
                </div>
              </div>
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
              {filters.paymentMode !== 'all' && (
                <span className="ml-2 text-indigo-600 font-semibold">
                  ({getPaymentModeLabel(filters.paymentMode)} payments)
                </span>
              )}
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

// ============================================================================
// HELPER FUNCTIONS - UPDATED
// ============================================================================

const getPaymentModeLabel = (mode: string): string => {
  const labels: Record<string, string> = {
    'APBS': 'APBS',
    'BANK': 'Bank Transfer',
    'IOB': 'IOB'
  };
  return labels[mode] || mode;
};

const getPaymentModeIcon = (mode: string): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    'APBS': <CreditCard className="w-4 h-4 text-blue-600" />,
    'BANK': <Building2 className="w-4 h-4 text-green-600" />,
    'IOB': <RefreshCw className="w-4 h-4 text-purple-600" />
  };
  return icons[mode] || null;
};

const getPaymentModeInfoStyle = (mode: string): string => {
  const styles: Record<string, string> = {
    'APBS': 'bg-blue-50 border-blue-200',
    'BANK': 'bg-green-50 border-green-200',
    'IOB': 'bg-purple-50 border-purple-200'
  };
  return styles[mode] || 'bg-gray-50 border-gray-200';
};

const getPaymentModeDescription = (mode: string): string => {
  const descriptions: Record<string, string> = {
    'APBS': 'Showing beneficiaries receiving payments through APBS (Aadhaar Payment Bridge System) with penny drop verification.',
    'BANK': 'Showing beneficiaries receiving payments through traditional bank transfers (RTGS/Cheque) without Aadhaar.',
    'IOB': 'Showing beneficiaries receiving payments through IOB (Indian Overseas Bank) system.'
  };
  return descriptions[mode] || '';
};

// ============================================================================
// FILTER TAG COMPONENT
// ============================================================================

interface FilterTagProps {
  label: string;
  onRemove: () => void;
  icon?: React.ReactNode;
}

const FilterTag: React.FC<FilterTagProps> = ({ label, onRemove, icon }) => {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
      {icon}
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

export default IntegratedBeneficiaryFilters;