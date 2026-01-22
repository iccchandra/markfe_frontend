import React, { useState } from 'react';
import { Filter, Search, X, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterParams } from '../../services/payRecordsApi.service';

interface PayRecordsFilterProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  onSearch: () => void;
  onReset: () => void;
}

export const PayRecordsFilter: React.FC<PayRecordsFilterProps> = ({
  filters,
  onFilterChange,
  onSearch,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (key: keyof FilterParams, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="text-blue-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Beneficiary ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beneficiary ID
              </label>
              <input
                type="text"
                value={filters.beneficiaryId || ''}
                onChange={(e) => handleChange('beneficiaryId', e.target.value)}
                placeholder="Enter ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beneficiary Name
              </label>
              <input
                type="text"
                value={filters.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage
              </label>
              <select
                value={filters.stage || ''}
                onChange={(e) => handleChange('stage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">All Stages</option>
                <option value="BL">BL - Base List</option>
                <option value="RL">RL - Revised List</option>
                <option value="RC">RC - Revision/Correction</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            {/* Bank Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={filters.bankPaymentStatus || ''}
                onChange={(e) => handleChange('bankPaymentStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Penny Drop Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Penny Drop Status
              </label>
              <select
                value={filters.pennyDropStatus || ''}
                onChange={(e) => handleChange('pennyDropStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="NOT_DONE">Not Done</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={filters.payment_with || ''}
                onChange={(e) => handleChange('payment_with', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="">All Methods</option>
                <option value="APBS">APBS</option>
                <option value="BANK">Bank Transfer</option>
              </select>
            </div>

         {/* Min Amount */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Min Amount (₹)
  </label>
  <select
    value={filters.minAmount || ''}
    onChange={(e) => handleChange('minAmount', e.target.value ? parseInt(e.target.value) : '')}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
  >
    <option value="">All Amounts</option>
    <option value="10000000">₹1,00,000 - ₹2,00,000</option>
    <option value="20000000">₹2,00,000 - ₹3,00,000</option>
    <option value="30000000">₹3,00,000 - ₹4,00,000</option>
    <option value="40000000">₹4,00,000 - ₹5,00,000</option>
    <option value="50000000">₹5,00,000 and above</option>
  </select>
</div>

            {/* Max Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Amount (₹)
              </label>
              <input
                type="number"
                value={filters.maxAmount ? filters.maxAmount / 100 : ''}
                onChange={(e) => handleChange('maxAmount', e.target.value ? parseFloat(e.target.value) * 100 : '')}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Date Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Field
              </label>
              <select
                value={filters.dateField || 'bankProcessedDate'}
                onChange={(e) => handleChange('dateField', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="bankProcessedDate">Bank Processed Date</option>
                <option value="uploadDate">Upload Date</option>
                <option value="createdAt">Created Date</option>
              </select>
            </div>

            {/* Records Per Page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Records Per Page
              </label>
              <select
                value={filters.limit || 50}
                onChange={(e) => handleChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onSearch}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <Search size={18} />
              Apply Filters
            </button>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
            >
              <X size={18} />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};