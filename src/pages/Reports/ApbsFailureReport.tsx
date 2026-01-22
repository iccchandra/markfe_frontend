// src/pages/Reports/ApbsFailureReport.tsx

import React, { useState } from 'react';
import {
  AlertCircle,
  RefreshCw,
  Download,
  Calendar,
  Filter,
  Users,
} from 'lucide-react';
import { useDateRange, useApbsFailureReport } from '../../hooks/useApbsFailureReport';
import { DailySummaryCard } from './cards/DailySummaryCard';
import { ReattemptAnalysisCard } from './cards/ReattemptAnalysisCard';
import { ResolutionTrackingCard } from './cards/ResolutionTrackingCard'; // ✅ Fixed import
import { SummaryStatsCard } from './cards/SummaryStatsCard';
import { TopFailureReasonsCard } from './cards/TopFailureReasonsCard';
import { FilterPanel } from './FilterPanel';
import { BeneficiaryListModal } from './modals/BeneficiaryListModal';

type PaymentStage = 'BL' | 'RL' | 'RC' | 'COMPLETED';

export const ApbsFailureReport: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<PaymentStage | ''>(''); // ✅ Fixed type
  const [showFilters, setShowFilters] = useState(false);
  const [showBeneficiaryModal, setShowBeneficiaryModal] = useState(false);

  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setLast7Days,
    setLast30Days,
    setCurrentMonth,
  } = useDateRange(30);

  const { data, loading, error, refetch } = useApbsFailureReport({
    startDate,
    endDate,
    stage: selectedStage || undefined, // ✅ Now properly typed
  });

  const handleExport = async () => {
    try {
      console.log('Exporting report...');
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Report</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                APBS Failure Report
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track payment failures, re-attempts, and resolution rates
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <button
                onClick={refetch}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Quick Date Filters */}
          <div className="flex items-center gap-2 mt-4">
            <Calendar className="w-4 h-4 text-gray-400" />
            <button
              onClick={setLast7Days}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={setLast30Days}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Last 30 Days
            </button>
            <button
              onClick={setCurrentMonth}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Current Month
            </button>
            <div className="ml-4 flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          selectedStage={selectedStage}
          onStageChange={(stage) => setSelectedStage(stage as PaymentStage | '')} // ✅ Type assertion
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary Stats */}

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DailySummaryCard data={data.dailySummary} />
              <ReattemptAnalysisCard data={data.reattemptAnalysis} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResolutionTrackingCard data={data.resolutionTracking} />
              <TopFailureReasonsCard data={data.topFailureReasons} />
            </div>

            {/* View Beneficiaries Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowBeneficiaryModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
              >
                <Users className="w-5 h-5" />
                View Failed Beneficiaries
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Beneficiary List Modal */}
      {showBeneficiaryModal && (
        <BeneficiaryListModal
          startDate={startDate}
          endDate={endDate}
          stage={selectedStage || undefined}
          onClose={() => setShowBeneficiaryModal(false)}
        />
      )}
    </div>
  );
};