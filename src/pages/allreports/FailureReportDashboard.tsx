// src/components/FailureReportDashboard.tsx
import React, { useState } from 'react';
import {
  AlertTriangle,
  Users,
  DollarSign,
  XCircle,
  AlertCircle,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  TrendingDown,
  Building2,
  RefreshCw,
  CheckCircle,
  RotateCcw
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
  Cell
} from 'recharts';
import { useFailureReport } from '../../hooks/useFailureReport';


const CATEGORY_COLORS: Record<string, string> = {
  SUCCESS: '#10B981',
  BANK_RETURN: '#EF4444',
  NPCI_REJECTION: '#F59E0B',
  MANDATE: '#6366F1',
  OTHER: '#6B7280'
};

export const FailureReportDashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    days: 30,
    stage: '',
    responseCode: '',
    category: ''
  });

  const [expandedFailure, setExpandedFailure] = useState<string | null>(null);
  const { data, loading, error, fetchData, exportReport } = useFailureReport();

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleFetch = () => {
    const params: any = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (!filters.startDate && !filters.endDate) params.days = filters.days;
    if (filters.stage) params.stage = filters.stage;
    if (filters.responseCode) params.responseCode = filters.responseCode;
    if (filters.category) params.category = filters.category;
    fetchData(params);
  };

  const handleExport = () => {
    const params: any = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (!filters.startDate && !filters.endDate) params.days = filters.days;
    if (filters.stage) params.stage = filters.stage;
    if (filters.responseCode) params.responseCode = filters.responseCode;
    if (filters.category) params.category = filters.category;
    exportReport(params);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Initial welcome screen
  if (!data && !loading && !error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-4xl w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Failure Analysis Report
              </h2>
              <p className="text-gray-600">
                Comprehensive analysis of transaction failures with retry metrics
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Last N Days
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.days}
                    onChange={(e) => handleFilterChange('days', parseInt(e.target.value))}
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={60}>Last 60 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.stage}
                    onChange={(e) => handleFilterChange('stage', e.target.value)}
                  >
                    <option value="">All Stages</option>
                    <option value="BL">BL</option>
                    <option value="RL">RL</option>
                    <option value="RC">RC</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="BANK_RETURN">Bank Return</option>
                    <option value="NPCI_REJECTION">NPCI Rejection</option>
                    <option value="MANDATE">Mandate</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Response Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 91, 96, 58"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filters.responseCode}
                    onChange={(e) => handleFilterChange('responseCode', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleFetch}
              className="w-full mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-lg font-semibold transition-colors"
            >
              <Search className="h-5 w-5" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-xl">Loading failure report...</p>
          <p className="text-gray-500 mt-2">This may take a moment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Error</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={handleFetch} 
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const top10Failures = data.data.slice(0, 10);
  const categoryChartData = data.summary.categoryBreakdown;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Export */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Failure Analysis Report</h1>
              <p className="text-sm text-gray-600">
                {new Date(data.dateRange.startDate).toLocaleDateString('en-IN')} - {new Date(data.dateRange.endDate).toLocaleDateString('en-IN')}
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleFetch} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button 
                onClick={handleExport} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Export Excel
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-6 gap-4">
            <input 
              type="date" 
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={filters.startDate} 
              onChange={(e) => handleFilterChange('startDate', e.target.value)} 
            />
            <input 
              type="date" 
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={filters.endDate} 
              onChange={(e) => handleFilterChange('endDate', e.target.value)} 
            />
            <select 
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={filters.days} 
              onChange={(e) => handleFilterChange('days', parseInt(e.target.value))}
            >
              <option value={7}>7d</option>
              <option value={30}>30d</option>
              <option value={60}>60d</option>
              <option value={90}>90d</option>
            </select>
            <select 
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={filters.stage} 
              onChange={(e) => handleFilterChange('stage', e.target.value)}
            >
              <option value="">All Stages</option>
              <option value="BL">BL</option>
              <option value="RL">RL</option>
              <option value="RC">RC</option>
            </select>
            <select 
              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              value={filters.category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="BANK_RETURN">Bank Return</option>
              <option value="NPCI_REJECTION">NPCI</option>
            </select>
            <button 
              onClick={handleFetch} 
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>

        {/* Summary Cards Row 1 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Failures</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(data.summary.totalFailures)}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Unique Reasons</p>
                <p className="text-2xl font-bold text-orange-600">{formatNumber(data.summary.uniqueFailureReasons)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Affected Users</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(data.summary.uniqueBeneficiariesAffected)}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Failed Amount</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(data.summary.totalFailedAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Retry Metrics Cards Row 2 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Retried</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(data.summary.totalRetried)}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Succeeded After Retry</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(data.summary.totalSucceededAfterRetry)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Still Failing</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(data.summary.totalStillFailing)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Retry Success Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{data.summary.overallRetrySuccessRate.toFixed(1)}%</p>
              </div>
              <Building2 className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Top 10 Failures</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={top10Failures.map(f => ({ 
                code: f.responseCode, 
                count: f.uniqueBeneficiaries 
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="code" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  label={(e) => `${e.category}: ${e.percentage.toFixed(1)}%`}
                  outerRadius={80}
                  dataKey="count"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={index} fill={CATEGORY_COLORS[entry.category] || '#6B7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failures Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Failure Details with Retry Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Retried</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Succeeded</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Still Failing</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Retry Rate</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">%</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((failure) => (
                  <React.Fragment key={failure.responseCode}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-red-600">
                        {failure.responseCode}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {failure.reasonDescription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 font-medium">
                          {failure.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-gray-900">
                        {formatNumber(failure.uniqueBeneficiaries)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-blue-600">
                        {formatNumber(failure.retriedBeneficiaries)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-green-600">
                        {formatNumber(failure.succeededAfterRetry)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-red-600">
                        {formatNumber(failure.stillFailing)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`px-2 py-1 rounded font-semibold ${
                          failure.retrySuccessRate >= 50 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {failure.retrySuccessRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 font-medium">
                        {formatCurrency(failure.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {failure.failurePercentage.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <button
                          onClick={() => setExpandedFailure(
                            expandedFailure === failure.responseCode ? null : failure.responseCode
                          )}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 mx-auto"
                        >
                          {expandedFailure === failure.responseCode ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Details
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expandedFailure === failure.responseCode && (
                      <tr>
                        <td colSpan={11} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-sm mb-2 text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                Action Required:
                              </h4>
                              <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                                {failure.actionToBeTaken}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold text-sm mb-2 text-gray-900">Stage Breakdown:</h4>
                                <div className="space-y-2">
                                  {failure.stageBreakdown.map((stage) => (
                                    <div key={stage.stage} className="flex justify-between p-2 bg-white rounded border border-gray-200">
                                      <span className="font-medium text-gray-900">{stage.stage}</span>
                                      <span className="text-gray-700">{formatNumber(stage.failedCount)} failures</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm mb-2 text-gray-900">Top Affected Banks:</h4>
                                <div className="space-y-2">
                                  {failure.topAffectedBanks.map((bank) => (
                                    <div key={bank.bankIIN} className="flex justify-between p-2 bg-white rounded border border-gray-200">
                                      <span className="text-sm text-gray-700">{bank.bankName}</span>
                                      <span className="font-semibold text-gray-900">{formatNumber(bank.failureCount)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FailureReportDashboard;