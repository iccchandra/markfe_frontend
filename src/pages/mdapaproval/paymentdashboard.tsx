import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  IndianRupee,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  FileX,
} from 'lucide-react';
import paymentVerificationService from '../../services/payment-verification.service';
import { DashboardStats, StageStats } from '../../types/payment.types';


/**
 * Dashboard Component with Stage-Wise Report
 * Shows overall payment verification statistics and stage-wise breakdown
 */

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  bgColor,
  textColor,
  subtitle,
}) => (
  <div className={`${bgColor} rounded-lg shadow-md p-6 transition-transform hover:scale-105`}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
        <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
        {subtitle && <p className={`text-xs ${textColor} opacity-70 mt-1`}>{subtitle}</p>}
      </div>
      <div className={`${textColor} opacity-80`}>{icon}</div>
    </div>
  </div>
);

interface StageCardProps {
  stage: StageStats;
}

const StageCard: React.FC<StageCardProps> = ({ stage }) => {
  const getStageColor = (stageName: string) => {
    switch (stageName) {
      case 'PENNY_DROP':
        return 'bg-purple-50 border-purple-200 text-purple-700';
      case 'BL':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'RL':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'RC':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'COMPLETED':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getStageName = (stageName: string) => {
    switch (stageName) {
      case 'PENNY_DROP':
        return 'Penny Drop';
      case 'BL':
        return 'BL Stage';
      case 'RL':
        return 'RL Stage';
      case 'RC':
        return 'RC Stage';
      case 'COMPLETED':
        return 'Completed';
      default:
        return stageName;
    }
  };

  const successRate = stage.approved > 0
    ? ((stage.paymentSuccessful / stage.approved) * 100).toFixed(2)
    : '0.00';

  return (
    <div className={`border-2 rounded-lg p-6 ${getStageColor(stage.stage)} transition-transform hover:scale-105`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{getStageName(stage.stage)}</h3>
        <BarChart3 className="w-6 h-6" />
      </div>

      {/* Main Stats */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Total Approvals:</span>
          <span className="text-lg font-bold">{stage.totalApprovals.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">MD Approved:</span>
          <span className="text-lg font-bold">{stage.approved.toLocaleString()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Success Rate</span>
          <span className="font-bold">{successRate}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
            style={{ width: `${successRate}%` }}
          />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-opacity-30">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-xl font-bold text-green-700">
            {stage.paymentSuccessful.toLocaleString()}
          </p>
          <p className="text-xs">Paid</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FileX className="w-4 h-4 text-yellow-600" />
          </div>
          <p className="text-xl font-bold text-yellow-700">
            {stage.notPresented.toLocaleString()}
          </p>
          <p className="text-xs">Not Presented</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-xl font-bold text-red-700">
            {stage.presentedButFailed.toLocaleString()}
          </p>
          <p className="text-xs">Failed</p>
        </div>
      </div>
    </div>
  );
};

const PaymentDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [stages, setStages] = useState<StageStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both dashboard stats and stage-wise data
      const [dashboardResponse, stageResponse] = await Promise.all([
        paymentVerificationService.getDashboard(),
        paymentVerificationService.getStageWise(),
      ]);
      
      // Ensure all required fields exist with defaults
      const safeStats: DashboardStats = {
        totalApprovals: dashboardResponse.stats?.totalApprovals || 0,
        approved: dashboardResponse.stats?.approved || 0,
        hasPaymentRecord: dashboardResponse.stats?.hasPaymentRecord || 0,
        paymentSuccessful: dashboardResponse.stats?.paymentSuccessful || 0,
        approvedNotPaid: dashboardResponse.stats?.approvedNotPaid || 0,
        notPresented: dashboardResponse.stats?.notPresented || dashboardResponse.stats?.approvedNotPaid || 0,
        presentedButFailed: dashboardResponse.stats?.presentedButFailed || 0,
        totalApprovedAmount: dashboardResponse.stats?.totalApprovedAmount || 0,
        totalPaidAmount: dashboardResponse.stats?.totalPaidAmount || 0,
        totalApprovedAmountFormatted: dashboardResponse.stats?.totalApprovedAmountFormatted || '₹0.00',
        totalPaidAmountFormatted: dashboardResponse.stats?.totalPaidAmountFormatted || '₹0.00',
      };
      
      setStats(safeStats);
      setStages(stageResponse.stages || []);
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = () => {
    fetchDashboard();
  };

  // Show loading state
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center mb-2">
            <XCircle className="w-6 h-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">Error</h3>
          </div>
          <p className="text-red-700 mb-2">{error}</p>
          <p className="text-sm text-gray-600 mb-4">
            Make sure the backend API is running at: {process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1'}
          </p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Return null if no stats yet
  if (!stats) {
    return null;
  }

  // Safe calculations with fallbacks
  const successRate = (stats.approved && stats.approved > 0)
    ? ((stats.paymentSuccessful / stats.approved) * 100).toFixed(2)
    : '0.00';
  
  const notPresentedCount = stats.notPresented || 0;
  const failedCount = stats.presentedButFailed || 0;
  
  const notPresentedRate = (stats.approved && stats.approved > 0)
    ? ((notPresentedCount / stats.approved) * 100).toFixed(2)
    : '0.00';

  // Calculate stage totals
  const stageTotals = stages.reduce(
    (acc, stage) => ({
      totalApprovals: acc.totalApprovals + stage.totalApprovals,
      approved: acc.approved + stage.approved,
      paymentSuccessful: acc.paymentSuccessful + stage.paymentSuccessful,
      notPresented: acc.notPresented + stage.notPresented,
      presentedButFailed: acc.presentedButFailed + stage.presentedButFailed,
    }),
    {
      totalApprovals: 0,
      approved: 0,
      paymentSuccessful: 0,
      notPresented: 0,
      presentedButFailed: 0,
    }
  );

  const overallSuccessRate =
    stageTotals.approved > 0
      ? ((stageTotals.paymentSuccessful / stageTotals.approved) * 100).toFixed(2)
      : '0.00';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Verification Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Housing Scheme Payment Management System
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Approvals"
          value={stats.totalApprovals.toLocaleString()}
          icon={<Users className="w-10 h-10" />}
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          subtitle="MD approved records"
        />

        <StatCard
          title="Successful Payments"
          value={stats.paymentSuccessful.toLocaleString()}
          icon={<CheckCircle2 className="w-10 h-10" />}
          bgColor="bg-green-50"
          textColor="text-green-700"
          subtitle={`${successRate}% success rate`}
        />

        <StatCard
          title="Not Presented"
          value={notPresentedCount.toLocaleString()}
          icon={<Clock className="w-10 h-10" />}
          bgColor="bg-yellow-50"
          textColor="text-yellow-700"
          subtitle="Not sent to bank"
        />

        <StatCard
          title="Failed Payments"
          value={failedCount.toLocaleString()}
          icon={<AlertTriangle className="w-10 h-10" />}
          bgColor="bg-red-50"
          textColor="text-red-700"
          subtitle="Payment failed"
        />
      </div>

      {/* Amount Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Approved Amount</h3>
            <IndianRupee className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalApprovedAmountFormatted}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            {stats.totalApprovedAmount.toLocaleString('en-IN', { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2 
            })} rupees
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Total Paid Amount</h3>
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalPaidAmountFormatted}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Successfully disbursed
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">
              {stats.approved.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">MD Approved</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-800">
              {stats.hasPaymentRecord.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">Has Payment Record</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">
              {successRate}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Success Rate</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">
              {notPresentedRate}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Not Presented Rate</p>
          </div>
        </div>
      </div>

      {/* Stage-Wise Report Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Stage-Wise Report
        </h2>
        <p className="text-gray-600 mb-6">Payment completion breakdown by stage</p>

        {/* Stage Summary */}
        {stages.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Overall Summary</h3>
              <TrendingUp className="w-8 h-8" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{stageTotals.totalApprovals.toLocaleString()}</p>
                <p className="text-sm opacity-80 mt-1">Total</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{stageTotals.approved.toLocaleString()}</p>
                <p className="text-sm opacity-80 mt-1">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-300">{stageTotals.paymentSuccessful.toLocaleString()}</p>
                <p className="text-sm opacity-80 mt-1">Paid</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-300">{stageTotals.notPresented.toLocaleString()}</p>
                <p className="text-sm opacity-80 mt-1">Not Presented</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-300">{stageTotals.presentedButFailed.toLocaleString()}</p>
                <p className="text-sm opacity-80 mt-1">Failed</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex justify-between items-center">
                <span className="text-lg">Overall Success Rate:</span>
                <span className="text-3xl font-bold">{overallSuccessRate}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Stage Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stages.map((stage) => (
            <StageCard key={stage.stage} stage={stage} />
          ))}
        </div>

        {/* Empty State */}
        {stages.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No stage data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDashboard;