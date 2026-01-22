// src/components/reports/WeeklyDisbursement.tsx
import React, { useEffect, useState } from 'react';
import { useWeeklyDisbursement } from '../../hooks/useReports';
import { ReportFormat } from '../../services/reportsApi';
import { Download, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
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

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export const WeeklyDisbursement: React.FC = () => {
  const { data, loading, error, fetchDisbursement, download } = useWeeklyDisbursement();
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);
  const [downloadFormat, setDownloadFormat] = useState<ReportFormat>(ReportFormat.EXCEL);

  useEffect(() => {
    fetchDisbursement(selectedWeek);
  }, [selectedWeek, fetchDisbursement]);

  const handleRefresh = () => {
    fetchDisbursement(selectedWeek);
  };

  const handleDownload = async () => {
    await download(downloadFormat, selectedWeek);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  // Prepare chart data
  const stageChartData = data ? [
    { name: 'BL', count: data.byStage.BL.count, amount: data.byStage.BL.amount },
    { name: 'RL', count: data.byStage.RL.count, amount: data.byStage.RL.amount },
    { name: 'RC', count: data.byStage.RC.count, amount: data.byStage.RC.amount },
    { name: 'COMPLETED', count: data.byStage.COMPLETED.count, amount: data.byStage.COMPLETED.amount }
  ] : [];

  const pieChartData = stageChartData.map((item, index) => ({
    name: item.name,
    value: item.amount,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Week Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Download Format
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={downloadFormat}
              onChange={(e) => setDownloadFormat(e.target.value as ReportFormat)}
            >
              <option value={ReportFormat.EXCEL}>Excel</option>
              <option value={ReportFormat.CSV}>CSV</option>
              <option value={ReportFormat.PDF}>PDF</option>
            </select>
          </div>
          <div className="md:col-span-5 flex items-end gap-2">
            <button
              onClick={handleDownload}
              disabled={loading || !data}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Download Report
            </button>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {data && (
        <>
          {/* Week Period */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold text-gray-900">Weekly Disbursement Report</h2>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(data.weekStartDate).toLocaleDateString()} - {new Date(data.weekEndDate).toLocaleDateString()}
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Total Disbursed This Week</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.totalDisbursed)}</p>
              <div className="flex items-center gap-1 mt-2">
                {data.weekOverWeekComparison.disbursementChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm ${data.weekOverWeekComparison.disbursementChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(Math.abs(data.weekOverWeekComparison.disbursementChange))} vs last week
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Overall Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{formatPercentage(data.successRate.overall)}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Cumulative To Date</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(data.cumulativeToDate)}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Disbursement by Stage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'amount') return formatCurrency(value);
                      return value.toLocaleString();
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="#3B82F6" name="Count" />
                  <Bar yAxisId="right" dataKey="amount" fill="#10B981" name="Amount (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Amount Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stage-wise Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stage-wise Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(data.byStage).map(([stage, info]) => (
                <div key={stage} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{stage}</h4>
                  <div className="border-t border-gray-200 pt-3 space-y-1">
                    <p className="text-sm text-gray-600">Count: {info.count.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Amount: {formatCurrency(info.amount)}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Success Rate: {formatPercentage(data.successRate.byStage[stage] || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklyDisbursement;