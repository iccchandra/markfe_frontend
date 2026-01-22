import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  FileX,
} from 'lucide-react';
import { StageStats } from '../../types/payment.types';
import paymentVerificationService from '../../services/payment-verification.service';


/**
 * Stage Wise Report Component - FIXED
 * Shows payment statistics by stage with corrected field names
 */

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

const StageWiseReport: React.FC = () => {
  const [stages, setStages] = useState<StageStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStageWise = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await paymentVerificationService.getStageWise();
      setStages(response.stages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load stage-wise data');
      console.error('Stage-wise fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStageWise();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading stage-wise report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
        <div className="flex items-center mb-2">
          <XCircle className="w-6 h-6 text-red-600 mr-2" />
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
        </div>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchStageWise}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate totals
  const totals = stages.reduce(
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
    totals.approved > 0
      ? ((totals.paymentSuccessful / totals.approved) * 100).toFixed(2)
      : '0.00';

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Stage-Wise Report</h2>
            <p className="text-gray-600 mt-1">Payment completion by stage</p>
          </div>
          <button
            onClick={fetchStageWise}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Overall Summary</h3>
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{totals.totalApprovals.toLocaleString()}</p>
            <p className="text-sm opacity-80 mt-1">Total</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{totals.approved.toLocaleString()}</p>
            <p className="text-sm opacity-80 mt-1">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-300">{totals.paymentSuccessful.toLocaleString()}</p>
            <p className="text-sm opacity-80 mt-1">Paid</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-yellow-300">{totals.notPresented.toLocaleString()}</p>
            <p className="text-sm opacity-80 mt-1">Not Presented</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-300">{totals.presentedButFailed.toLocaleString()}</p>
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

      {/* Stage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stages.map((stage) => (
          <StageCard key={stage.stage} stage={stage} />
        ))}
      </div>

      {/* Empty State */}
      {stages.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No stage data available</p>
        </div>
      )}
    </div>
  );
};

export default StageWiseReport;