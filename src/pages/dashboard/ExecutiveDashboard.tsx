import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Users, IndianRupeeIcon, CheckCircle, Filter, RefreshCw, AlertCircle, TrendingUp, Award
} from 'lucide-react';
import { apiService } from '../../services/api.service';

interface DashboardData {
  overview: {
    total_beneficiaries: number;
    successful_beneficiaries: number;
    total_disbursed_amount: {
      crores: number;
    };
    total_successful_transactions: number;
    unique_penny_drops_done: number;
    unique_banks_involved: number;
    districts_covered: number;
  };
  stage_wise: Array<{
    stage_code: string;
    stage_name: string;
    beneficiary_count: number;
    total_amount: {
      crores: number;
    };
  }>;
  payment_methods: Array<{
    payment_method: string;
    beneficiary_count: number;
    percentage: number;
    total_amount: {
      crores: number;
    };
  }>;
  weekly_trend: Array<{
    week: string;
    week_start_date: string;
    beneficiary_count: number;
    total_amount: {
      crores: number;
    };
  }>;
  amount_ranges: Array<{
    range: string;
    beneficiary_count: number;
    percentage: number;
  }>;
}

const ExecutiveDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    stage: '',
    payment_with: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    console.log('🚀 ExecutiveDashboard mounted');
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    console.log('📡 Fetching dashboard with filters:', filters);
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getExecutiveDashboard(filters);
      console.log('✅ Dashboard data received:', result);
      
      if (!result || !result.overview) {
        throw new Error('Invalid data structure');
      }
      
      setData(result);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchDashboard();
  };

  const clearFilters = () => {
    setFilters({ stage: '', payment_with: '', startDate: '', endDate: '' });
    setTimeout(() => fetchDashboard(), 100);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Format everything as crores, even small amounts
  const formatCrores = (crores: number): string => {
    if (crores >= 1) {
      return `₹${crores.toFixed(2)}Cr`;
    } else if (crores >= 0.01) {
      return `₹${crores.toFixed(4)}Cr`;
    } else {
      return `₹${crores.toFixed(6)}Cr`;
    }
  };

  const formatPercentage = (percent: number): string => {
    return `${percent.toFixed(1)}%`;
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading Executive Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-6">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No data available</p>
          <button
            onClick={fetchDashboard}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
              <p className="text-gray-600 mt-1">Housing Scheme Payment Analytics (All amounts in Crores)</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              <button
                onClick={fetchDashboard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
                  <select
                    value={filters.stage}
                    onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Stages</option>
                    <option value="BL">BL Only</option>
                    <option value="RL">BL → RL</option>
                    <option value="RC">BL → RL → RC</option>
                    <option value="COMPLETED">All Stages Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={filters.payment_with}
                    onChange={(e) => setFilters({ ...filters, payment_with: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Methods</option>
                    <option value="APBS">APBS</option>
                    <option value="BANK">BANK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* KPI Cards Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Beneficiaries */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Beneficiaries</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(data.overview.total_beneficiaries)}
            </p>
            <div className="mt-3 flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-bold text-base">
                {formatNumber(data.overview.successful_beneficiaries)}
              </span>
              <span className="text-gray-600 ml-1">paid</span>
              <span className="text-gray-400 mx-1">/</span>
              <span className="text-gray-900 font-bold text-base">
                {formatNumber(data.overview.total_beneficiaries)}
              </span>
              <span className="text-gray-600 ml-1">total</span>
            </div>
          </div>

          {/* Total Disbursed */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <IndianRupeeIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Success paid</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCrores(data.overview.total_disbursed_amount.crores)}
            </p>
            <p className="text-sm text-green-600 mt-3 font-medium">
              Successfully transferred
            </p>
          </div>

          {/* Penny Drops & Banks */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Verifications</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Penny Drops:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(data.overview.unique_penny_drops_done)}
                </span>
              </div>
            
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stage-wise Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stage-wise Distribution</h2>
            {data.stage_wise && data.stage_wise.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.stage_wise}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="stage_code" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'Beneficiaries') return [formatNumber(value), name];
                      if (name === 'Amount') return [formatCrores(value), name];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="beneficiary_count" fill="#3b82f6" name="Beneficiaries" />
                  <Bar dataKey={(item) => item.total_amount.crores} fill="#10b981" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No stage data available
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-2">Amounts in Crores (Cr)</p>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h2>
            {data.payment_methods && data.payment_methods.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.payment_methods}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.payment_method}: ${entry.percentage.toFixed(1)}%`}
                    outerRadius={100}
                    dataKey="beneficiary_count"
                  >
                    {data.payment_methods.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: string, props: any) => {
                      if (name === 'Beneficiaries') {
                        return [
                          `${formatNumber(value)} (${formatCrores(props.payload.total_amount.crores)})`,
                          name
                        ];
                      }
                      return [formatNumber(value), name];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No payment method data available
              </div>
            )}
          </div>
        </div>

        {/* Weekly Trend */}
        {data.weekly_trend && data.weekly_trend.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trend</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data.weekly_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="week_start_date" 
                  stroke="#6b7280"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" stroke="#6b7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: any, name: string) => {
                    if (name === 'Beneficiaries') return [formatNumber(value), name];
                    if (name === 'Amount') return [formatCrores(value), name];
                    return [value, name];
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="beneficiary_count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  name="Beneficiaries"
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={(item) => item.total_amount.crores}
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Amount"
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-2">Amounts in Crores (Cr)</p>
          </div>
        )}

        {/* Amount Distribution */}
        {data.amount_ranges && data.amount_ranges.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Beneficiary Amount Distribution</h2>
            <p className="text-sm text-gray-600 mb-4">Distribution by total amount received per beneficiary</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {data.amount_ranges.map((range, index) => (
                <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">{range.range}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(range.beneficiary_count)}
                  </p>
                  <p className="text-sm text-gray-600">{range.percentage.toFixed(1)}%</p>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.amount_ranges}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: any) => [formatNumber(value), 'Beneficiaries']}
                />
                <Bar dataKey="beneficiary_count" fill="#6366f1" name="Beneficiaries" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-2">Individual beneficiary amounts shown in Lakhs (L)</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveDashboard;