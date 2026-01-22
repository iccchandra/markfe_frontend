// ReconciliationList-OPTIMIZED.tsx
// ✅ COMPLETE OPTIMIZATION with proper calculations and better UX

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Eye,
  Download,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  Percent,
  TrendingUp,
  DollarSign,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  useReconciliations,
  useCreateReconciliation,
  useExportReconciliation,
} from '../../hooks/useReconciliation';
import {
  ReconciliationStatus,
  reconciliationApiService,
  ReconciliationBatch,
} from '../../services/api/reconciliation.service';

export const ReconciliationList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadBatchId, setUploadBatchId] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadedBy, setUploadedBy] = useState('admin@example.com');

  // Hooks
  const {
    reconciliations,
    loading,
    error,
    pagination,
    refetch,
    setPage,
  } = useReconciliations({ page: 1, limit: 20 });

  const { createReconciliation, loading: creating } = useCreateReconciliation();
  const { exportReconciliation, exporting } = useExportReconciliation();

  // ✅ Calculate actual match rates and enhance data
  const enhancedReconciliations = useMemo(() => {
    return reconciliations.map(batch => {
      // Calculate actual match rate from success/total ratio
      const actualMatchRate = batch.totalBankRecords > 0
        ? (batch.bankPaymentSuccess / batch.totalBankRecords) * 100
        : 0;
      
      // Calculate success rate (same as match rate in this context)
      const successRate = actualMatchRate;
      
      // Calculate amount success rate
      const amountSuccessRate = batch.totalAmountExpected > 0
        ? (batch.totalAmountPaid / batch.totalAmountExpected) * 100
        : 0;

      return {
        ...batch,
        actualMatchRate,
        successRate,
        amountSuccessRate,
      };
    });
  }, [reconciliations]);

  // Filter reconciliations
  const filteredReconciliations = useMemo(() => {
    return enhancedReconciliations.filter((batch) => {
      const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;
      const matchesSearch = searchQuery === '' ||
        batch.batchId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.uploadedBy?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [enhancedReconciliations, filterStatus, searchQuery]);

  // ✅ Calculate aggregate statistics
  const aggregateStats = useMemo(() => {
    if (filteredReconciliations.length === 0) {
      return {
        totalRecords: 0,
        totalSuccess: 0,
        totalFailed: 0,
        overallSuccessRate: 0,
        totalAmountExpected: 0,
        totalAmountPaid: 0,
        totalVariance: 0,
      };
    }

    const stats = filteredReconciliations.reduce((acc, batch) => ({
      totalRecords: acc.totalRecords + batch.totalBankRecords,
      totalSuccess: acc.totalSuccess + batch.bankPaymentSuccess,
      totalFailed: acc.totalFailed + batch.bankPaymentFailed,
      totalAmountExpected: acc.totalAmountExpected + batch.totalAmountExpected,
      totalAmountPaid: acc.totalAmountPaid + batch.totalAmountPaid,
      totalVariance: acc.totalVariance + Math.abs(batch.amountVariance),
    }), {
      totalRecords: 0,
      totalSuccess: 0,
      totalFailed: 0,
      totalAmountExpected: 0,
      totalAmountPaid: 0,
      totalVariance: 0,
    });

    return {
      ...stats,
      overallSuccessRate: stats.totalRecords > 0
        ? (stats.totalSuccess / stats.totalRecords) * 100
        : 0,
    };
  }, [filteredReconciliations]);

  const handleCreateReconciliation = async () => {
    if (!uploadBatchId.trim() || !uploadedBy.trim()) {
      alert('Please fill in Batch ID and Uploaded By fields');
      return;
    }

    const result = await createReconciliation({
      batchId: uploadBatchId.trim(),
      fileName: uploadFileName.trim() || undefined,
      uploadedBy: uploadedBy.trim(),
    });

    if (result) {
      alert('✅ Reconciliation created successfully!');
      setShowUploadModal(false);
      setUploadBatchId('');
      setUploadFileName('');
      refetch();
    }
  };

  const handleExport = async (batchId: string, reconciliationId: string) => {
    await exportReconciliation(
      reconciliationId,
      `Reconciliation_${batchId}_${Date.now()}.xlsx`
    );
  };

  const getStatusBadge = (status: ReconciliationStatus) => {
    const config = reconciliationApiService.getStatusConfig(status);
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.bgClass} ${config.textClass} ${config.borderClass}`}
      >
        {config.label}
      </span>
    );
  };

  const formatAmount = (amount: number): string => {
    return reconciliationApiService.formatAmountInCrores(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && reconciliations.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reconciliation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reconciliation</h1>
            <p className="mt-2 text-gray-600">
              Post-payment reconciliation and analysis
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Create Reconciliation
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-800">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* ✅ NEW: Aggregate Statistics Cards */}
        {filteredReconciliations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={<FileText className="w-5 h-5 text-blue-600" />}
              label="Total Records"
              value={aggregateStats.totalRecords.toLocaleString()}
              color="bg-blue-50"
              subValue={`${filteredReconciliations.length} batches`}
            />
            <StatCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Success Rate"
              value={`${aggregateStats.overallSuccessRate.toFixed(2)}%`}
              color="bg-green-50"
              subValue={`${aggregateStats.totalSuccess.toLocaleString()} successful`}
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5 text-indigo-600" />}
              label="Total Paid"
              value={formatAmount(aggregateStats.totalAmountPaid)}
              color="bg-indigo-50"
              subValue={`of ${formatAmount(aggregateStats.totalAmountExpected)}`}
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-amber-600" />}
              label="Total Variance"
              value={formatAmount(aggregateStats.totalVariance)}
              color="bg-amber-50"
              subValue={`${aggregateStats.totalFailed.toLocaleString()} failed`}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by batch ID, file name, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Active filters info */}
          {(searchQuery || filterStatus !== 'all') && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
              Showing {filteredReconciliations.length} of {reconciliations.length} reconciliations
              {(searchQuery || filterStatus !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                  className="ml-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredReconciliations.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No reconciliations found</p>
              {(searchQuery || filterStatus !== 'all') && (
                <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Batch Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Records
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Payment Results
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Financial
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReconciliations.map((batch) => {
                    const successRate = batch.actualMatchRate || 0;
                    
                    return (
                      <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                        {/* Batch Info */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-indigo-600 mb-1 cursor-pointer hover:text-indigo-700"
                               onClick={() => navigate(`/reconciliation/${batch.id}`)}>
                            {batch.fileName || batch.batchId}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(batch.uploadDate)}
                          </div>
                          <div className="text-xs text-gray-500">
                            By: {batch.uploadedBy || 'system'}
                          </div>
                          {batch.responseType && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                              {batch.responseType}
                            </span>
                          )}
                        </td>

                        {/* Records */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-semibold text-gray-900">
                              {batch.totalBankRecords.toLocaleString()}
                            </span>
                          </div>
                          {batch.withPennyDrop > 0 && (
                            <div className="text-xs text-gray-600">
                              PD: {batch.pennyDropSuccess.toLocaleString()} ✓ / {batch.pennyDropFailed.toLocaleString()} ✗
                            </div>
                          )}
                        </td>

                        {/* Payment Results */}
                        <td className="px-6 py-4">
                          {batch.status === 'PENDING' ? (
                            <div className="text-sm text-gray-500 italic">Awaiting...</div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-700">
                                  {batch.bankPaymentSuccess.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <XCircle className="w-4 h-4 text-red-600" />
                                <span className="text-sm font-semibold text-red-700">
                                  {batch.bankPaymentFailed.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Financial */}
                        <td className="px-6 py-4">
                          {batch.status === 'PENDING' ? (
                            <div className="text-sm text-gray-500">-</div>
                          ) : (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-600">
                                Expected: <span className="font-semibold text-gray-900">
                                  {formatAmount(batch.totalAmountExpected)}
                                </span>
                              </div>
                              <div className="text-xs text-green-700">
                                Paid: <span className="font-semibold">
                                  {formatAmount(batch.totalAmountPaid)}
                                </span>
                              </div>
                              {batch.amountVariance !== 0 && (
                                <div className="flex items-center gap-1 text-xs text-amber-700">
                                  <AlertTriangle className="w-3 h-3" />
                                  {formatAmount(Math.abs(batch.amountVariance))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Success Rate with Progress Bar */}
                        <td className="px-6 py-4">
                          {batch.status === 'PENDING' ? (
                            <div className="text-sm text-gray-500">-</div>
                          ) : (
                            <div className="space-y-2">
                              {/* Progress Bar */}
                              <div className="w-24">
                                <div className="bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      successRate >= 95
                                        ? 'bg-green-600'
                                        : successRate >= 85
                                        ? 'bg-yellow-600'
                                        : 'bg-red-600'
                                    }`}
                                    style={{ width: `${Math.min(successRate, 100)}%` }}
                                  />
                                </div>
                              </div>
                              
                              {/* Percentage */}
                              <div className="flex items-center gap-1">
                                <Percent className="w-4 h-4 text-gray-400" />
                                <span className={`text-sm font-bold ${
                                  successRate >= 95
                                    ? 'text-green-700'
                                    : successRate >= 85
                                    ? 'text-yellow-700'
                                    : 'text-red-700'
                                }`}>
                                  {successRate.toFixed(2)}%
                                </span>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {getStatusBadge(batch.status)}
                          {batch.processedDate && (
                            <div className="text-xs text-gray-500 mt-2">
                              {new Date(batch.processedDate).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: '2-digit',
                              })}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/reconciliation/${batch.id}`)}
                              className="p-2 hover:bg-indigo-100 rounded text-indigo-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {batch.status === 'COMPLETED' && (
                              <button
                                onClick={() => handleExport(batch.batchId, batch.id)}
                                disabled={exporting}
                                className="p-2 hover:bg-green-100 rounded text-green-600 transition-colors disabled:opacity-50"
                                title="Download Report"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} reconciliations
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages || loading}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Create Reconciliation
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Create reconciliation from a processed batch (after response file upload)
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch ID *
                  </label>
                  <input
                    type="text"
                    value={uploadBatchId}
                    onChange={(e) => setUploadBatchId(e.target.value)}
                    placeholder="e.g., BATCH001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The batch ID (not the UUID)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Name (optional)
                  </label>
                  <input
                    type="text"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    placeholder="e.g., response_file.txt"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Uploaded By *
                  </label>
                  <input
                    type="text"
                    value={uploadedBy}
                    onChange={(e) => setUploadedBy(e.target.value)}
                    placeholder="e.g., admin@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={creating}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReconciliation}
                  disabled={creating || !uploadBatchId.trim() || !uploadedBy.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// StatCard Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  subValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  color,
  subValue,
}) => {
  return (
    <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-6`}>
      <div className="flex items-start justify-between mb-3">
        <div className="p-3 rounded-lg bg-white">{icon}</div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
      {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
    </div>
  );
};

export default ReconciliationList;