// src/components/FailedTransactionsModal.tsx
import React, { useState, useEffect } from 'react';
import { useFailedTransactions } from '../../hooks/useFailedTransactions';
import {
  X,
  AlertCircle,
  Download,
  Filter,
  DollarSign,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2
} from 'lucide-react';
import type { FailedBeneficiary } from '../../services/failedTransactionsApi';

interface FailedTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  initialFailedCount: number;
}

export const FailedTransactionsModal: React.FC<FailedTransactionsModalProps> = ({
  isOpen,
  onClose,
  date,
  initialFailedCount
}) => {
  const { data, loading, error, fetchData, exportData } = useFailedTransactions();

  const [groupBy, setGroupBy] = useState<'none' | 'reason' | 'bank' | 'stage'>('none');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [filterBank, setFilterBank] = useState('');
  const [filterStage, setFilterStage] = useState('');

  useEffect(() => {
    if (isOpen && date) {
      fetchData({
        date,
        groupBy,
        ...(filterReason && { reasonCode: filterReason }),
        ...(filterBank && { bankIIN: filterBank }),
        ...(filterStage && { stage: filterStage })
      });
    }
  }, [isOpen, date, groupBy, filterReason, filterBank, filterStage, fetchData]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setGroupBy('none');
      setExpandedGroups(new Set());
      setSearchQuery('');
      setFilterReason('');
      setFilterBank('');
      setFilterStage('');
    }
  }, [isOpen]);

  const handleExport = () => {
    if (date) {
      exportData({
        date,
        groupBy,
        ...(filterReason && { reasonCode: filterReason }),
        ...(filterBank && { bankIIN: filterBank }),
        ...(filterStage && { stage: filterStage })
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar) return 'N/A';
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  };

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      BL: 'bg-blue-100 text-blue-800',
      RL: 'bg-purple-100 text-purple-800',
      RC: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getStageName = (stage: string) => {
    const names: Record<string, string> = {
      BL: 'Base Line',
      RL: 'Roof Line',
      RC: 'Roof Casting',
      COMPLETED: 'Completed'
    };
    return names[stage] || stage;
  };

  const filteredRecords = (records: FailedBeneficiary[]) => {
    if (!searchQuery) return records;
    const query = searchQuery.toLowerCase();
    return records.filter(
      r =>
        r.name.toLowerCase().includes(query) ||
        r.beneficiaryId.toLowerCase().includes(query) ||
        r.aadhaarNumber.includes(query)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Failed Transactions</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(date).toLocaleDateString('en-IN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading && !data ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading failed transactions...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-900">Error Loading Data</h3>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              ) : data ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-red-700 font-medium">Total Failed</p>
                          <p className="text-2xl font-bold text-red-900 mt-1">{data.totalFailed}</p>
                        </div>
                        <div className="p-2 bg-red-200 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-red-700" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-700 font-medium">Failed Amount</p>
                          <p className="text-xl font-bold text-orange-900 mt-1">
                            {formatCurrency(data.totalFailedAmount)}
                          </p>
                        </div>
                        <div className="p-2 bg-orange-200 rounded-lg">
                          <DollarSign className="h-5 w-5 text-orange-700" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-700 font-medium">Unique Reasons</p>
                          <p className="text-2xl font-bold text-purple-900 mt-1">
                            {data.summary.byReason.length}
                          </p>
                        </div>
                        <div className="p-2 bg-purple-200 rounded-lg">
                          <FileText className="h-5 w-5 text-purple-700" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Filter className="h-4 w-4 text-gray-600" />
                      <h3 className="text-sm font-semibold text-gray-900">Filters & Grouping</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Group By
                        </label>
                        <select
                          value={groupBy}
                          onChange={e => setGroupBy(e.target.value as any)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="none">No Grouping</option>
                          <option value="reason">By Reason</option>
                          <option value="bank">By Bank</option>
                          <option value="stage">By Stage</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Filter by Reason
                        </label>
                        <select
                          value={filterReason}
                          onChange={e => setFilterReason(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Reasons</option>
                          {data.summary.byReason.map(r => (
                            <option key={r.code} value={r.code}>
                              {r.code} - {r.description} ({r.count})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Filter by Bank
                        </label>
                        <select
                          value={filterBank}
                          onChange={e => setFilterBank(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Banks</option>
                          {data.summary.byBank.map(b => (
                            <option key={b.iin} value={b.iin}>
                              {b.bankName} ({b.count})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Filter by Stage
                        </label>
                        <select
                          value={filterStage}
                          onChange={e => setFilterStage(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Stages</option>
                          {data.summary.byStage.map(s => (
                            <option key={s.stage} value={s.stage}>
                              {getStageName(s.stage)} ({s.count})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Search
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Name, ID, Aadhaar..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Statistics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* By Reason */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Failure Reasons</h3>
                      <div className="space-y-2">
                        {data.summary.byReason.slice(0, 5).map(reason => (
                          <div key={reason.code} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {reason.code} - {reason.description}
                              </p>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-red-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${reason.percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className="ml-3 text-xs font-semibold text-gray-700">
                              {reason.count}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* By Bank */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Banks with Failures</h3>
                      <div className="space-y-2">
                        {data.summary.byBank.slice(0, 5).map(bank => (
                          <div key={bank.iin} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">{bank.bankName}</p>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-orange-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${bank.percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className="ml-3 text-xs font-semibold text-gray-700">{bank.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* By Stage */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Failures by Stage</h3>
                      <div className="space-y-2">
                        {data.summary.byStage.map(stage => (
                          <div key={stage.stage} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900">
                                {getStageName(stage.stage)}
                              </p>
                              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-purple-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${stage.percentage}%` }}
                                />
                              </div>
                            </div>
                            <span className="ml-3 text-xs font-semibold text-gray-700">{stage.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Data Display - Grouped or Flat */}
                  {groupBy !== 'none' && data.groups ? (
                    <div className="space-y-3">
                      {data.groups.map(group => (
                        <div key={group.groupKey} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <button
                            onClick={() => toggleGroup(group.groupKey)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {expandedGroups.has(group.groupKey) ? (
                                <ChevronUp className="h-4 w-4 text-gray-600" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                              )}
                              <div className="text-left">
                                <h3 className="text-sm font-semibold text-gray-900">{group.groupName}</h3>
                                {group.reasonDescription && (
                                  <p className="text-xs text-gray-600 mt-0.5">{group.reasonDescription}</p>
                                )}
                                {group.actionToBeTaken && (
                                  <p className="text-xs text-blue-600 mt-0.5">
                                    Action: {group.actionToBeTaken}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xs text-gray-600">Count</p>
                                <p className="text-lg font-bold text-gray-900">{group.count}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-600">Amount</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {formatCurrency(group.totalAmount)}
                                </p>
                              </div>
                            </div>
                          </button>

                          {expandedGroups.has(group.groupKey) && (
                            <div className="border-t border-gray-200">
                              <BeneficiaryTable records={filteredRecords(group.records)} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900">
                          All Failed Beneficiaries ({data.records?.length || 0})
                        </h3>
                      </div>
                      <BeneficiaryTable records={filteredRecords(data.records || [])} />
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Beneficiary Table Component
const BeneficiaryTable: React.FC<{ records: FailedBeneficiary[] }> = ({ records }) => {
  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      BL: 'bg-blue-100 text-blue-800',
      RL: 'bg-purple-100 text-purple-800',
      RC: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const maskAadhaar = (aadhaar: string) => {
    if (!aadhaar) return 'N/A';
    return `XXXX-XXXX-${aadhaar.slice(-4)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  return (
    <div className="overflow-x-auto max-h-96">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Beneficiary ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aadhaar
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stage
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Bank
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reason
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action Required
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map(record => (
            <tr key={record.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-900">
                {record.beneficiaryId}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-900">
                {record.name}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">
                {maskAadhaar(record.aadhaarNumber)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStageColor(
                    record.stage
                  )}`}
                >
                  {record.stage}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs font-semibold text-gray-900">
                {formatCurrency(record.uploadedAmount)}
              </td>
              <td className="px-4 py-3 text-xs text-gray-900">
                <div>
                  <p className="font-medium">{record.fullBankName}</p>
                  <p className="text-xs text-gray-500">{record.bankIIN}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-xs">
                <div>
                  <p className="font-medium text-red-600">{record.responseCode}</p>
                  <p className="text-xs text-gray-600 max-w-xs line-clamp-2">{record.reasonDescription}</p>
                </div>
              </td>
              <td className="px-4 py-3 text-xs text-gray-600 max-w-md">
                <p className="line-clamp-2">{record.actionToBeTaken}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {records.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No records found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default FailedTransactionsModal;