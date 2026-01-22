// src/pages/BatchesManagement.tsx
import React, { useState, useMemo } from 'react'; // ✅ Add useMemo
import {
  Upload,
  Eye,
  Edit,
  Download,
  Search,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useBatches } from '../../hooks/useBatches';
import { BatchFilterDto } from '../../services/api/batch.service';

type WorkStage = 'bl' | 'rl' | 'rc' | 'completed';

export const BatchesManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterWorkStage, setFilterWorkStage] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'PENNY_DROP' | 'PAYMENT'>('PAYMENT');

  // ✅ FIXED: Use useMemo to prevent infinite loop
  const filters = useMemo<BatchFilterDto>(() => ({
    page: 1,
    limit: 20,
    ...(filterStatus !== 'all' && { status: filterStatus as any }),
    ...(filterWorkStage !== 'all' && { workStage: filterWorkStage as any }),
  }), [filterStatus, filterWorkStage]); // ← Only recreate when these change

  const {
    batches,
    loading,
    error,
    total,
    fetchBatches,
    deleteBatch,
    uploadBatchFile,
    exportBatches,
  } = useBatches(filters);

  const getWorkStageBadge = (stage: string, count: number) => {
    const stageKey = stage.toLowerCase() as WorkStage;
    const config: Record<WorkStage, { style: string; label: string; icon: string }> = {
      bl: { style: 'bg-blue-100 text-blue-800 border-blue-300', label: 'BL Stage', icon: '📋' },
      rl: { style: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'RL Stage', icon: '🚀' },
      rc: { style: 'bg-purple-100 text-purple-800 border-purple-300', label: 'RC Stage', icon: '✓' },
      completed: { style: 'bg-green-100 text-green-800 border-green-300', label: 'Work Done', icon: '🎉' },
    };
    const { style, label, icon } = config[stageKey] || config.bl;
    return (
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm">{icon}</span>
        <span className={`px-2 py-1 rounded text-xs font-semibold border ${style}`}>
          {label}
        </span>
        <span className="text-sm font-medium text-gray-700">{count.toLocaleString()}</span>
      </div>
    );
  };

  const formatAmount = (amount: number): string => {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) return;

    try {
      await uploadBatchFile(uploadFile, uploadType);
      setShowUploadModal(false);
      setUploadFile(null);
      // Show success toast/notification here
      alert('Batch uploaded successfully!');
    } catch (error) {
      // Show error toast/notification here
      alert('Failed to upload batch');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      const success = await deleteBatch(id);
      if (success) {
        alert('Batch deleted successfully!');
      } else {
        alert('Failed to delete batch');
      }
    }
  };

  const handleExport = async () => {
    await exportBatches(filters);
  };

  const filteredBatches = batches.filter((batch) => {
    return (
      searchQuery === '' ||
      batch.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 max-w-2xl">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Batches</h3>
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={() => fetchBatches(filters)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading batches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Batch Management</h1>
            <p className="mt-2 text-gray-600">
              Manage beneficiary batches and track work progress ({total} total batches)
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Batch
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Total Batches" value={batches.length.toString()} color="bg-blue-50" icon="📦" />
          <StatCard
            label="Total Beneficiaries"
            value={`${(batches.reduce((sum, b) => sum + b.totalRecords, 0) / 1000).toFixed(1)}K`}
            color="bg-purple-50"
            icon="👥"
          />
          <StatCard
            label="Active Batches"
            value={batches.filter((b) => b.status === 'ACTIVE').length.toString()}
            color="bg-green-50"
            icon="✅"
          />
          <StatCard
            label="Total Amount"
            value={formatAmount(batches.reduce((sum, b) => sum + b.amount, 0))}
            color="bg-indigo-50"
            icon="💰"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by batch ID or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <select
              value={filterWorkStage}
              onChange={(e) => setFilterWorkStage(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Work Stages</option>
              <option value="BL">BL Stage</option>
              <option value="RL">RL Stage</option>
              <option value="RC">RC Stage</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Batch Info</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type & Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Records</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quality</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-indigo-600">{batch.batchId}</div>
                      <div className="text-xs text-gray-500 mt-1">{batch.createdBy}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            batch.batchType === 'PAYMENT'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {batch.batchType}
                        </span>
                        {batch.workStage && (
                          <div>{getWorkStageBadge(batch.workStage, batch.totalRecords)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">
                          {batch.totalRecords.toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600">✓ {batch.validRecords}</div>
                        {batch.invalidRecords > 0 && (
                          <div className="text-xs text-red-600">✗ {batch.invalidRecords}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-green-600 text-lg">{formatAmount(batch.amount)}</div>
                      <div className="text-xs text-gray-600">
                        ₹{(batch.amountPerBeneficiary / 100000).toFixed(0)}L per person
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          batch.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : batch.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${batch.dataQuality}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{batch.dataQuality}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => (window.location.href = `/batches/${batch.id}`)}
                          className="p-2 hover:bg-indigo-50 rounded text-indigo-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(batch.id)}
                          className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBatches.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No batches found</p>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Batch</h2>
              <p className="text-gray-600 mb-4">Upload Excel/CSV file with beneficiary data</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Type</label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as 'PENNY_DROP' | 'PAYMENT')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="PAYMENT">Payment Batch</option>
                  <option value="PENNY_DROP">Penny Drop Batch</option>
                </select>
              </div>

              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6 hover:border-indigo-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {uploadFile ? uploadFile.name : 'Drag and drop or click to select'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Supports .xlsx, .xls, .csv files</p>
                <input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={!uploadFile}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string;
  color: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color, icon }) => {
  return (
    <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-4xl opacity-30">{icon}</div>
      </div>
    </div>
  );
};

export default BatchesManagement;