import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService, { PaymentTrendItem, RejectionBreakdownItem } from '../../services/dashboard.service';
import { DashboardStats } from '../../types';

// ============================================
// Helper Functions - Defined at the top
// ============================================
const formatNumber = (num: number): string => {
  const value = Number(num);
  if (value >= 100000) {
    return `${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const formatCurrency = (amount: number): string => {
  const value = Number(amount);
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(2)}K`;
  }
  return `₹${value.toFixed(2)}`;
};

const getStageName = (stage: string): string => {
  const stageNames: Record<string, string> = {
    'BL': 'Beneficiary List',
    'RL': 'Recommendation List',
    'RC': 'Reconciliation',
    'COMPLETED': 'Completed',
  };
  return stageNames[stage] || stage;
};

// ============================================
// Main Dashboard Component
// ============================================
export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [paymentTrend, setPaymentTrend] = useState<PaymentTrendItem[]>([]);
  const [rejectionData, setRejectionData] = useState<RejectionBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReconciliationId, setSelectedReconciliationId] = useState<string | undefined>(undefined);
  const [trendDays, setTrendDays] = useState<number>(7);

  useEffect(() => {
    fetchAllDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReconciliationId, trendDays]);

  const fetchAllDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await dashboardService.fetchAllDashboardData(
        selectedReconciliationId,
        trendDays
      );
      
      setStats(data.stats);
      setPaymentTrend(data.trend);
      setRejectionData(data.rejections);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTrendDaysChange = (days: number) => {
    setTrendDays(days);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg font-semibold">{error}</p>
          <button
            onClick={fetchAllDashboardData}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Indiramma Housing Scheme - Payment Processing System</p>
        </div>
        
        {/* Trend Days Filter */}
        <div className="flex gap-2">
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => handleTrendDaysChange(days)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                trendDays === days
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Transaction Attempts"
          value={stats?.totalBeneficiaries ? formatNumber(stats.totalBeneficiaries) : '0'}
          icon={<Users className="w-8 h-8" />}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <KPICard
          title="Penny Drop Verified"
          value={stats?.pennyDropVerified ? formatNumber(stats.pennyDropVerified) : '0'}
          subtext={`${stats?.dataQualityScore ?? 0}% verified`}
          icon={<CheckCircle className="w-8 h-8" />}
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
        <KPICard
          title="Successful Payments"
          value={stats?.successfulPayments ? formatNumber(stats.successfulPayments) : '0'}
          subtext={`${stats?.successfulPayments && stats?.totalBeneficiaries 
            ? ((stats.successfulPayments / stats.totalBeneficiaries) * 100).toFixed(2) 
            : 0}% success`}
          icon={<TrendingUp className="w-8 h-8" />}
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <KPICard
          title="Failed Payments"
          value={stats?.failedPayments ? formatNumber(stats.failedPayments) : '0'}
          subtext={`${stats?.rejectionRate ?? 0}% rejection rate`}
          icon={<AlertCircle className="w-8 h-8" />}
          bgColor="bg-red-50"
          iconColor="text-red-600"
        />
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <FinancialRow
              label="Total Amount"
              value={stats?.totalAmount ? formatCurrency(stats.totalAmount) : '₹0'}
              color="text-gray-800"
            />
            <FinancialRow
              label="Amount Processed"
              value={stats?.amountProcessed ? formatCurrency(stats.amountProcessed) : '₹0'}
              color="text-green-600"
            />
            <FinancialRow
              label="Amount Reconciliated"
              value={stats?.amountReconciliated ? formatCurrency(stats.amountReconciliated) : '₹0'}
              color="text-green-600"
            />
            <FinancialRow
              label="Amount Discrepancy"
              value={stats?.amountProcessed && stats?.amountReconciliated 
                ? formatCurrency(stats.amountProcessed - stats.amountReconciliated)
                : '₹0'}
              color="text-orange-600"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Stage Progression</h3>
          <div className="space-y-3">
            {stats?.stageProgression.map((stage) => (
              <div key={stage.stage}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">{getStageName(stage.stage)}</span>
                  <span className="text-sm font-bold text-gray-800">
                    {formatNumber(stage.count)} ({stage.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trend */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Trend (Last {trendDays} Days)</h3>
          {paymentTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={paymentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} name="Sent" />
                <Line type="monotone" dataKey="confirmed" stroke="#10b981" strokeWidth={2} name="Confirmed" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No payment trend data available
            </div>
          )}
        </div>

        {/* Rejection Types */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rejection Breakdown</h3>
          {rejectionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={rejectionData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {rejectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No rejection data available
            </div>
          )}
        </div>
      </div>

      {/* Checkpoint & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Checkpoints Earned</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.checkpointsEarned ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Quality</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.dataQualityScore ?? 0}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rejection Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.rejectionRate ?? 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// KPI Card Component
// ============================================
interface KPICardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtext,
  icon,
  bgColor,
  iconColor,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Financial Row Component
// ============================================
interface FinancialRowProps {
  label: string;
  value: string;
  color: string;
}

const FinancialRow: React.FC<FinancialRowProps> = ({ label, value, color }) => {
  return (
    <div className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
      <span className="text-gray-600">{label}</span>
      <span className={`font-bold ${color}`}>{value}</span>
    </div>
  );
};

export default Dashboard;
