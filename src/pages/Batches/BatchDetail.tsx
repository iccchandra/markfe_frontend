// src/pages/BatchDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Share2,
  Users,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useBatchDetail } from '../../hooks/useBatches';

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { batch, stats, loading, error, fetchBatch, fetchStats, activateBatch } = useBatchDetail(id);

  const handleActivate = async () => {
    if (window.confirm('Are you sure you want to activate this batch?')) {
      const result = await activateBatch();
      if (result) {
        alert('Batch activated successfully!');
      } else {
        alert('Failed to activate batch');
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-6 max-w-2xl">
          <div className="flex items-start gap-3">
            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Batch</h3>
              <p className="text-sm text-red-800">{error}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => id && fetchBatch(id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
                <button
                  onClick={() => navigate('/batches')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !batch || !stats) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading batch details...</p>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'BL', value: stats.stageDistribution.bl, color: '#3b82f6' },
    { name: 'RL', value: stats.stageDistribution.rl, color: '#f59e0b' },
    { name: 'RC', value: stats.stageDistribution.rc, color: '#8b5cf6' },
    { name: 'COMPLETED', value: stats.stageDistribution.completed, color: '#10b981' },
  ];

  const stageMetrics = [
    {
      stage: 'BL',
      count: stats.stageDistribution.bl,
      amount: '₹1L',
      totalAmount: (stats.stageDistribution.bl * stats.amountPerBeneficiary) / 10000000,
    },
    {
      stage: 'RL',
      count: stats.stageDistribution.rl,
      amount: '₹1L',
      totalAmount: (stats.stageDistribution.rl * stats.amountPerBeneficiary) / 10000000,
    },
    {
      stage: 'RC',
      count: stats.stageDistribution.rc,
      amount: '₹2L',
      totalAmount: (stats.stageDistribution.rc * stats.amountPerBeneficiary * 2) / 10000000,
    },
    {
      stage: 'COMPLETED',
      count: stats.stageDistribution.completed,
      amount: '₹1L',
      totalAmount: (stats.stageDistribution.completed * stats.amountPerBeneficiary) / 10000000,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/batches')}
              className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{batch.batchId}</h1>
              <p className="text-gray-600 mt-1">
                {stats.totalBeneficiaries.toLocaleString()} Beneficiaries | ₹
                {(stats.expectedAmount / 10000000).toFixed(2)}Cr
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {batch.status === 'DRAFT' && (
              <button
                onClick={handleActivate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                Activate Batch
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <Users className="w-4 h-4" />
              View Beneficiaries
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
            label="Penny Drop Verified"
            value={`${(stats.pennyDropStats.verified / 1000).toFixed(0)}K`}
            subtext={`${((stats.pennyDropStats.verified / stats.totalBeneficiaries) * 100).toFixed(1)}%`}
            color="bg-green-50"
          />
          <MetricCard
            icon={<XCircle className="w-6 h-6 text-red-600" />}
            label="Penny Drop Failed"
            value={stats.pennyDropStats.failed.toLocaleString()}
            subtext={`${((stats.pennyDropStats.failed / stats.totalBeneficiaries) * 100).toFixed(1)}%`}
            color="bg-red-50"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6 text-blue-600" />}
            label="Data Quality"
            value={`${stats.dataQuality}%`}
            subtext="Validation accuracy"
            color="bg-blue-50"
          />
          <MetricCard
            icon={<FileText className="w-6 h-6 text-purple-600" />}
            label="Status"
            value={batch.status}
            subtext={`${stats.variancePercentage.toFixed(2)}% variance`}
            color="bg-purple-50"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 rounded-t-lg shadow-sm">
          <div className="flex gap-8 px-6">
            {['overview', 'stages', 'details'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-indigo-600 border-indigo-600'
                    : 'text-gray-600 border-transparent hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Work Stage Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) =>
                          `${entry.name}: ${((entry.value / stats.totalBeneficiaries) * 100).toFixed(1)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Penny Drop Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Penny Drop Results</h3>
                  <p className="text-sm text-gray-600 mb-4">Pre-processing validation (one-time)</p>
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700">Verified</p>
                          <p className="text-2xl font-bold text-green-700">
                            {stats.pennyDropStats.verified.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {((stats.pennyDropStats.verified / stats.totalBeneficiaries) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700">Failed</p>
                          <p className="text-2xl font-bold text-red-700">
                            {stats.pennyDropStats.failed.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {((stats.pennyDropStats.failed / stats.totalBeneficiaries) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                        <XCircle className="w-8 h-8 text-red-600" />
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700">Pending</p>
                          <p className="text-2xl font-bold text-orange-700">
                            {stats.pennyDropStats.pending.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {((stats.pennyDropStats.pending / stats.totalBeneficiaries) * 100).toFixed(1)}% of total
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Payment Breakdown by Stage
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {stageMetrics.map((metric) => (
                    <div
                      key={metric.stage}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200"
                    >
                      <p className="text-sm font-semibold text-gray-700 mb-1">{metric.stage}</p>
                      <p className="text-2xl font-bold text-indigo-600 mb-1">{metric.amount}</p>
                      <p className="text-xs text-gray-600">{metric.count.toLocaleString()} beneficiaries</p>
                      <div className="mt-3 pt-3 border-t border-indigo-200">
                        <p className="text-xs text-gray-600">Total Stage Amount:</p>
                        <p className="text-lg font-bold text-green-600">₹{metric.totalAmount.toFixed(2)}Cr</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-300">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Grand Total (All Stages):</span>
                    <span className="text-3xl font-bold text-green-700">
                      ₹{(stats.expectedAmount / 10000000).toFixed(2)}Cr
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Message */}
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Payment Status Information</h3>
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Payment status will only be available after reconciliation</strong> when the bank return
                      file is uploaded.
                    </p>
                    <p className="text-sm text-blue-700">
                      Currently showing: Work stages (beneficiary progress) and Penny drop results (pre-processing
                      validation). Actual payment success/failure data appears after bank processes payments and returns
                      the status file.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stages' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Stage-wise Beneficiary Count</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Beneficiaries at Stage" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Batch Information</h3>
              <DetailRow label="Batch ID" value={batch.batchId} />
              <DetailRow label="Batch Type" value={batch.batchType} />
              <DetailRow label="Work Stage" value={batch.workStage || 'N/A'} />
              <DetailRow label="Total Beneficiaries" value={stats.totalBeneficiaries.toLocaleString()} />
              <DetailRow label="Total Amount" value={`₹${(stats.expectedAmount / 10000000).toFixed(2)}Cr`} />
              <DetailRow label="Amount Per Beneficiary" value={`₹${(stats.amountPerBeneficiary / 100000).toFixed(0)}L`} />
              <DetailRow label="Created By" value={batch.createdBy} />
              <DetailRow label="Created Date" value={new Date(batch.createdAt).toLocaleString('en-IN')} />
              <DetailRow label="Last Updated" value={new Date(batch.updatedAt).toLocaleString('en-IN')} />
              <DetailRow label="Data Quality Score" value={`${stats.dataQuality}%`} />
              <DetailRow label="Status" value={batch.status} />
              <DetailRow label="File Name" value={batch.fileName || 'N/A'} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper Components
interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, subtext, color }) => (
  <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-6`}>
    <div className="flex items-start justify-between mb-3">
      <div className="p-3 rounded-lg bg-white">{icon}</div>
    </div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-600 mt-1">{subtext}</p>
  </div>
);

interface DetailRowProps {
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className="font-semibold text-gray-900 text-right">{value}</span>
  </div>
);