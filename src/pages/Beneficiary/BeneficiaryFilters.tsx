// BeneficiaryFilters.tsx - Reusable filter component for beneficiary list

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { BeneficiaryFilters } from '../../types';

interface BeneficiaryFiltersComponentProps {
  filters: BeneficiaryFilters;
  onFilterChange: (filters: BeneficiaryFilters) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  uniqueBanks: string[];
  uniqueDistricts: string[];
  totalCount: number;
  filteredCount: number;
}

export const BeneficiaryFiltersComponent: React.FC<BeneficiaryFiltersComponentProps> = ({
  filters,
  onFilterChange,
  showAdvanced,
  onToggleAdvanced,
  uniqueBanks,
  uniqueDistricts,
  totalCount,
  filteredCount
}) => {
  // Check if any filters are active
  const hasActiveFilters = 
    filters.stage !== 'all' || 
    filters.pennyDrop !== 'all' || 
    filters.bank !== 'all' || 
    filters.district !== 'all' || 
    filters.paymentStatus !== 'all' || 
    filters.searchQuery !== '';

  // Clear all filters
  const clearFilters = () => {
    onFilterChange({
      stage: 'all',
      pennyDrop: 'all',
      bank: 'all',
      district: 'all',
      paymentStatus: 'all',
      searchQuery: ''
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, ID, account number, or village..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Toggle Advanced Filters Button */}
        <button
          onClick={onToggleAdvanced}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors ${
            showAdvanced 
              ? 'bg-indigo-50 border-indigo-300 text-indigo-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Advanced Filters
          {hasActiveFilters && !showAdvanced && (
            <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
              Active
            </span>
          )}
        </button>

        {/* Clear All Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters Section */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200 animate-fadeIn">
          {/* Work Stage Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Work Stage
            </label>
            <select
              value={filters.stage}
              onChange={(e) => onFilterChange({ ...filters, stage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="all">All Stages</option>
              <option value="BL">BL Stage</option>
              <option value="RL">RL Stage</option>
              <option value="RC">RC Stage</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Penny Drop Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Penny Drop Status
            </label>
            <select
              value={filters.pennyDrop}
              onChange={(e) => onFilterChange({ ...filters, pennyDrop: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="VERIFIED">Verified Only</option>
              <option value="FAILED">Failed Only</option>
              <option value="PENDING">Pending Only</option>
            </select>
          </div>

          {/* Bank Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Bank
            </label>
            <select
              value={filters.bank}
              onChange={(e) => onFilterChange({ ...filters, bank: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="all">All Banks</option>
              {uniqueBanks.map(bank => (
                <option key={bank} value={bank}>
                  {bank.length > 30 ? `${bank.substring(0, 30)}...` : bank}
                </option>
              ))}
            </select>
            {filters.bank !== 'all' && (
              <p className="text-xs text-gray-600 mt-1">
                Selected: {uniqueBanks.find(b => b === filters.bank)}
              </p>
            )}
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              District
            </label>
            <select
              value={filters.district}
              onChange={(e) => onFilterChange({ ...filters, district: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="all">All Districts</option>
              {uniqueDistricts.map(district => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => onFilterChange({ ...filters, paymentStatus: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="all">All</option>
              <option value="paid">Has Received Payment</option>
              <option value="not-paid">No Payment Yet</option>
              <option value="failures">With Failures</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Count and Active Filters Summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <strong className="text-gray-900">{filteredCount.toLocaleString()}</strong> of{' '}
          <strong className="text-gray-900">{totalCount.toLocaleString()}</strong> beneficiaries
          {hasActiveFilters && (
            <span className="ml-2 text-indigo-600 font-medium">(Filtered)</span>
          )}
        </div>

        {/* Active Filters Pills */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            {filters.stage !== 'all' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Stage: {filters.stage}
              </span>
            )}
            {filters.pennyDrop !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Penny Drop: {filters.pennyDrop}
              </span>
            )}
            {filters.bank !== 'all' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                Bank Filter Active
              </span>
            )}
            {filters.district !== 'all' && (
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                District: {filters.district}
              </span>
            )}
            {filters.paymentStatus !== 'all' && (
              <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
                Payment: {filters.paymentStatus}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiaryFiltersComponent;