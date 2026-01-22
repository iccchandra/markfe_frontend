// src/components/BankReportDashboard.tsx
import React, { useState } from 'react';
import {
  Building2,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Filter
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
import { useBankReport } from '../../hooks/useBankReport';

const COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1'];

export const BankReportDashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    days: 30,
    stage: '',
    bankIIN: ''
  });

  const [expandedBank, setExpandedBank] = useState<string | null>(null);

  const { data, loading, error, fetchData, exportReport } = useBankReport();

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleFetch = () => {
    const params: any = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (!filters.startDate && !filters.endDate) params.days = filters.days;
    if (filters.stage) params.stage = filters.stage;
    if (filters.bankIIN) params.bankIIN = filters.bankIIN;
    fetchData(params);
  };

  const handleExport = () => {
    const params: any = {};
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (!filters.startDate && !filters.endDate) params.days = filters.days;
    if (filters.stage) params.stage = filters.stage;
    if (filters.bankIIN) params.bankIIN = filters.bankIIN;
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
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bank-Wise Transaction Report
              </h2>
              <p className="text-gray-600">
                Analyze transaction performance across different banks with stage breakdown
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Last N Days
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    value={filters.days}
                    onChange={(e) => handleFilterChange('days', parseInt(e.target.value))}
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={15}>Last 15 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={60}>Last 60 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Stage
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    value={filters.stage}
                    onChange={(e) => handleFilterChange('stage', e.target.value)}
                  >
                    <option value="">All Stages</option>
                    <option value="BL">BL - Baseline</option>
                    <option value="RL">RL - Resubmit</option>
                    <option value="RC">RC - Reconciliation</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Bank IIN
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Bank IIN (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    value={filters.bankIIN}
                    onChange={(e) => handleFilterChange('bankIIN', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleFetch}
              disabled={loading}
              className="w-full mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-lg font-semibold"
            >
              <Search className="h-5 w-5" />
              Load Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bank report...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Error Loading Data</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleFetch}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Prepare chart data - Top 10 banks
  const topBanksData = data.data.slice(0, 10).map((bank) => ({
    name: bank.bankName.length > 20 ? bank.bankName.substring(0, 20) + '...' : bank.bankName,
    success: bank.successCount,
    failed: bank.failedCount,
    successRate: bank.successRate
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bank-Wise Transaction Report</h1>
              <p className="text-sm text-gray-600 mt-1">
                Transaction analysis by bank with stage breakdown
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Excel
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last N Days
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={filters.days}
                onChange={(e) => handleFilterChange('days', parseInt(e.target.value))}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
              >
                <option value="">All</option>
                <option value="BL">BL</option>
                <option value="RL">RL</option>
                <option value="RC">RC</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFetch}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
              >
                <Search className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing data from {new Date(data.dateRange.startDate).toLocaleDateString('en-IN')} to{' '}
            {new Date(data.dateRange.endDate).toLocaleDateString('en-IN')}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Banks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(data.summary.totalBanks)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Beneficiaries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatNumber(data.summary.totalBeneficiaries)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {data.summary.overallSuccessRate.toFixed(2)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(data.summary.totalSuccess)} / {formatNumber(data.summary.totalTransactions)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(data.summary.totalAmount)}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Banks by Transactions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top 10 Banks by Transactions
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topBanksData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill="#10B981" name="Success" />
                <Bar dataKey="failed" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Success Rate Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Success Rate Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Success', value: data.summary.totalSuccess },
                    { name: 'Failed', value: data.summary.totalFailed }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Banks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Beneficiaries
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Success
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Failed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.data.map((bank) => (
                  <React.Fragment key={bank.bankIIN}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {bank.bankName}
                          </div>
                          <div className="text-xs text-gray-500">{bank.bankIIN}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatNumber(bank.totalBeneficiaries)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatNumber(bank.totalTransactions)}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                        {formatNumber(bank.successCount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                        {formatNumber(bank.failedCount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatCurrency(bank.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              bank.successRate >= 90
                                ? 'bg-green-100 text-green-800'
                                : bank.successRate >= 75
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {bank.successRate.toFixed(2)}%
                          </span>
                          {bank.successRate >= 90 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() =>
                            setExpandedBank(expandedBank === bank.bankIIN ? null : bank.bankIIN)
                          }
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {expandedBank === bank.bankIIN ? 'Hide' : 'View'} Stages
                        </button>
                      </td>
                    </tr>
                    {expandedBank === bank.bankIIN && (
                      <tr>
                        <td colSpan={8} className="px-6 py-4 bg-gray-50">
                          <div className="text-sm">
                            <h4 className="font-semibold text-gray-900 mb-3">
                              Stage Breakdown for {bank.bankName}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {bank.stageBreakdown.map((stage) => (
                                <div
                                  key={stage.stage}
                                  className="bg-white p-4 rounded-lg border border-gray-200"
                                >
                                  <div className="text-xs text-gray-500 uppercase mb-1">
                                    {stage.stage}
                                  </div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {formatNumber(stage.totalTransactions)}
                                  </div>
                                  <div className="mt-2 space-y-1">
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Success:</span>
                                      <span className="text-green-600 font-semibold">
                                        {formatNumber(stage.successCount)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Failed:</span>
                                      <span className="text-red-600 font-semibold">
                                        {formatNumber(stage.failedCount)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <span className="text-gray-600">Rate:</span>
                                      <span className="font-semibold">
                                        {stage.successRate.toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
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

export default BankReportDashboard;