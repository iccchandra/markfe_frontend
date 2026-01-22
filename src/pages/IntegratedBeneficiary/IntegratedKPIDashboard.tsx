// Simple Straightforward Dashboard
// Shows: Attempts, Paid, Failed - That's it!

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Building2,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3002';

export const IntegratedKPIDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/integrated-beneficiaries/dashboard/kpis`);
      setData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">Failed to load dashboard</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-indigo-600" />
              Payment Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Attempts, Paid, Failed - Simple Facts
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(data.lastUpdated).toLocaleString('en-IN')}
            </p>
          </div>
          
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Overall Summary - Simple Facts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Total Beneficiaries */}
            <div className="bg-blue-50 rounded-lg border-2 border-blue-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-6 h-6 text-blue-600" />
                <p className="text-sm font-semibold text-gray-700">Total Beneficiaries</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {data.beneficiaryPopulation?.total?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">Unique people</p>
            </div>

            {/* Total Payment Attempts */}
            <div className="bg-purple-50 rounded-lg border-2 border-purple-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-6 h-6 text-purple-600" />
                <p className="text-sm font-semibold text-gray-700">Payment Attempts</p>
              </div>
              <p className="text-4xl font-bold text-gray-900">
                {data.operationalKPIs?.totalAttempts?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">Total attempts made</p>
            </div>

            {/* Successfully Paid */}
            <div className="bg-green-50 rounded-lg border-2 border-green-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <p className="text-sm font-semibold text-gray-700">Successfully Paid</p>
              </div>
              <p className="text-4xl font-bold text-green-700">
                {data.operationalKPIs?.successfulPayments?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {data.operationalKPIs?.successRate?.toFixed(1) || 0}% of attempts
              </p>
            </div>

            {/* Failed Payments */}
            <div className="bg-red-50 rounded-lg border-2 border-red-200 p-6">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-6 h-6 text-red-600" />
                <p className="text-sm font-semibold text-gray-700">Failed Payments</p>
              </div>
              <p className="text-4xl font-bold text-red-700">
                {data.operationalKPIs?.failedPayments?.toLocaleString() || 0}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {data.operationalKPIs?.failureRate?.toFixed(1) || 0}% of attempts
              </p>
            </div>

          </div>
        </div>

        {/* Payment Mode Breakdown */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            Payment Mode Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* APBS */}
            <SimpleModeCard
              title="APBS"
              beneficiaries={data.beneficiaryPopulation?.byPaymentMode?.apbs || 0}
              attempts={data.paymentModeBreakdown?.apbs?.attempts || 0}
              paid={data.paymentModeBreakdown?.apbs?.paid || 0}
              failed={data.paymentModeBreakdown?.apbs?.failed || 0}
              successRate={data.paymentModeBreakdown?.apbs?.successRate || 0}
              color="bg-blue-50 border-blue-200"
            />

            {/* Bank Transfer */}
            <SimpleModeCard
              title="Bank Transfer"
              beneficiaries={data.beneficiaryPopulation?.byPaymentMode?.bank || 0}
              attempts={data.paymentModeBreakdown?.bank?.attempts || 0}
              paid={data.paymentModeBreakdown?.bank?.paid || 0}
              failed={data.paymentModeBreakdown?.bank?.failed || 0}
              successRate={data.paymentModeBreakdown?.bank?.successRate || 0}
              color="bg-green-50 border-green-200"
            />

            {/* IOB */}
            <SimpleModeCard
              title="IOB"
              beneficiaries={data.beneficiaryPopulation?.byPaymentMode?.iob || 0}
              attempts={data.paymentModeBreakdown?.iob?.attempts || 0}
              paid={data.paymentModeBreakdown?.iob?.paid || 0}
              failed={data.paymentModeBreakdown?.iob?.failed || 0}
              successRate={data.paymentModeBreakdown?.iob?.successRate || 0}
              color="bg-purple-50 border-purple-200"
            />

          </div>
        </section>

        {/* Bank Performance Table */}
        {data.bankWiseAnalysis && data.bankWiseAnalysis.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-600" />
              Bank Performance
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bank</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Beneficiaries
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Attempts
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Paid
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Failed
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Success %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.bankWiseAnalysis.slice(0, 20).map((bank: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{bank.bankName}</td>
                        <td className="px-6 py-4 text-right text-indigo-600 font-semibold">
                          {bank.beneficiaryCount?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {bank.totalAttempts?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-right text-green-600 font-semibold">
                          {bank.successfulPayments?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-right text-red-600 font-semibold">
                          {bank.failedPayments?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-semibold ${
                            bank.successRate >= 95 ? 'text-green-600' :
                            bank.successRate >= 90 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {bank.successRate?.toFixed(1) || 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Beneficiaries with Failed Payments */}
        {data.beneficiariesWithFailures && data.beneficiariesWithFailures.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-600" />
              Beneficiaries with Failed Payments ({data.beneficiariesWithFailures.length})
            </h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-50 border-b border-red-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-red-900 uppercase">Beneficiary</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-red-900 uppercase">Mode</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-red-900 uppercase">Total Attempts</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-red-900 uppercase">Failed</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-red-900 uppercase">Paid</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-red-900 uppercase">Last Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.beneficiariesWithFailures.slice(0, 20).map((benef: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{benef.name}</div>
                          <div className="text-xs text-gray-500">{benef.beneficiaryId}</div>
                        </td>
                        <td className="px-6 py-4 text-sm">{benef.paymentMode}</td>
                        <td className="px-6 py-4 text-right">{benef.totalAttempts}</td>
                        <td className="px-6 py-4 text-right text-red-600 font-bold">{benef.failedCount}</td>
                        <td className="px-6 py-4 text-right text-green-600 font-bold">{benef.paidCount}</td>
                        <td className="px-6 py-4 text-xs text-gray-700 max-w-xs truncate">
                          {benef.lastRejectionReason || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

// Simple Mode Card Component
const SimpleModeCard: React.FC<any> = ({ 
  title, 
  beneficiaries, 
  attempts, 
  paid, 
  failed, 
  successRate, 
  color 
}) => (
  <div className={`${color} rounded-lg border-2 p-6`}>
    <h3 className="font-bold text-gray-900 mb-4 text-lg">{title}</h3>
    
    <div className="space-y-4">
      {/* Beneficiaries */}
      <div>
        <p className="text-xs text-gray-600 mb-1">Beneficiaries</p>
        <p className="text-2xl font-bold text-gray-900">{beneficiaries.toLocaleString()}</p>
      </div>

      {/* Attempts */}
      <div className="pt-3 border-t border-gray-300">
        <p className="text-xs text-gray-600 mb-1">Total Attempts</p>
        <p className="text-2xl font-bold text-purple-700">{attempts.toLocaleString()}</p>
      </div>

      {/* Paid vs Failed */}
      <div className="pt-3 border-t border-gray-300">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-600 mb-1">✅ Paid</p>
            <p className="text-xl font-bold text-green-600">{paid.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">❌ Failed</p>
            <p className="text-xl font-bold text-red-600">{failed.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="pt-3 border-t border-gray-300 bg-white/50 rounded px-3 py-2">
        <p className="text-xs text-gray-600 mb-1">Success Rate</p>
        <p className="text-2xl font-bold text-indigo-600">{successRate.toFixed(1)}%</p>
      </div>
    </div>
  </div>
);

export default IntegratedKPIDashboard;