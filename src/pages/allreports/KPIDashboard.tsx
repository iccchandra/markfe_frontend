import React from 'react';
import { 
  Users, TrendingUp, TrendingDown, CheckCircle, XCircle, 
  DollarSign, Percent, Activity, Filter as FilterIcon 
} from 'lucide-react';
import { PaymentKPIs } from '@/services/payRecordsApi.service';

interface KPIDashboardProps {
  kpis: PaymentKPIs | null;
  loading: boolean;
}

export const KPIDashboard: React.FC<KPIDashboardProps> = ({ kpis, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="text-blue-600" size={24} />
          Overview KPIs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Beneficiaries */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-blue-600" size={32} />
              <span className="text-xs font-medium text-blue-600 uppercase">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(kpis.overview.total_beneficiaries)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Beneficiaries</p>
          </div>

          {/* Successful Payments */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-600" size={32} />
              <span className="text-xs font-medium text-green-600 uppercase">Success</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(kpis.overview.beneficiaries_with_success)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {kpis.overview.success_rate_percentage}% Success Rate
            </p>
          </div>

          {/* Failed Payments */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="text-red-600" size={32} />
              <span className="text-xs font-medium text-red-600 uppercase">Failed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(kpis.overview.beneficiaries_with_failures)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {kpis.overview.failure_rate_percentage}% Failure Rate
            </p>
          </div>

          {/* Pending Payments */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="text-yellow-600" size={32} />
              <span className="text-xs font-medium text-yellow-600 uppercase">Pending</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatNumber(kpis.overview.beneficiaries_with_pending)}
            </p>
            <p className="text-sm text-gray-600 mt-1">In Progress</p>
          </div>
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FilterIcon className="text-purple-600" size={24} />
          Payment Method Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-indigo-900">APBS</h3>
              <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {((kpis.payment_method.beneficiaries_paid_via_apbs / kpis.overview.total_beneficiaries) * 100).toFixed(1)}%
              </div>
            </div>
            <p className="text-4xl font-bold text-indigo-600">
              {formatNumber(kpis.payment_method.beneficiaries_paid_via_apbs)}
            </p>
            <p className="text-sm text-gray-600 mt-2">Beneficiaries via APBS</p>
          </div>

          <div className="bg-teal-50 rounded-lg p-6 border-2 border-teal-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-teal-900">Bank Transfer</h3>
              <div className="bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {((kpis.payment_method.beneficiaries_paid_via_bank / kpis.overview.total_beneficiaries) * 100).toFixed(1)}%
              </div>
            </div>
            <p className="text-4xl font-bold text-teal-600">
              {formatNumber(kpis.payment_method.beneficiaries_paid_via_bank)}
            </p>
            <p className="text-sm text-gray-600 mt-2">Beneficiaries via Bank</p>
          </div>
        </div>
      </div>

      {/* Stage-wise Distribution */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="text-orange-600" size={24} />
          Stage-wise Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">
              {formatNumber(kpis.stages.beneficiaries_bl_stage)}
            </p>
            <p className="text-sm text-gray-600 mt-1">BL Stage</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-2xl font-bold text-purple-600">
              {formatNumber(kpis.stages.beneficiaries_rl_stage)}
            </p>
            <p className="text-sm text-gray-600 mt-1">RL Stage</p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-2xl font-bold text-orange-600">
              {formatNumber(kpis.stages.beneficiaries_rc_stage)}
            </p>
            <p className="text-sm text-gray-600 mt-1">RC Stage</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(kpis.stages.beneficiaries_completed)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>

          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-2xl font-bold text-gray-600">
              {formatNumber(kpis.stages.beneficiaries_with_multiple_stages)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Multiple Stages</p>
          </div>
        </div>
      </div>

      {/* Amount Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <DollarSign className="text-green-600" size={24} />
          Amount Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Total Success Amount</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(kpis.amounts.total_success_amount_rupees)}
            </p>
          </div>

          <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
            <p className="text-sm text-gray-600 mb-2">Total Failed Amount</p>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(kpis.amounts.total_failed_amount_rupees)}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
            <p className="text-sm text-gray-600 mb-2">Average Success Amount</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(kpis.amounts.avg_success_amount_rupees)}
            </p>
          </div>
        </div>

        {/* Amount Range Distribution */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Beneficiaries by Amount Range</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(kpis.amounts.amount_ranges).map(([range, count]) => (
              <div key={range} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-600 mt-1">{range}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Penny Drop Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Percent className="text-indigo-600" size={24} />
          Penny Drop Verification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200">
            <CheckCircle className="text-green-600 mb-3" size={32} />
            <p className="text-3xl font-bold text-green-600">
              {formatNumber(kpis.penny_drop.beneficiaries_pennydrop_success)}
            </p>
            <p className="text-sm text-gray-600 mt-2">Verified Successfully</p>
          </div>

          <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
            <XCircle className="text-red-600 mb-3" size={32} />
            <p className="text-3xl font-bold text-red-600">
              {formatNumber(kpis.penny_drop.beneficiaries_pennydrop_failed)}
            </p>
            <p className="text-sm text-gray-600 mt-2">Verification Failed</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
            <Activity className="text-gray-600 mb-3" size={32} />
            <p className="text-3xl font-bold text-gray-600">
              {formatNumber(kpis.penny_drop.beneficiaries_pennydrop_notdone)}
            </p>
            <p className="text-sm text-gray-600 mt-2">Not Verified Yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};
