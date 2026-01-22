// src/pages/Reports/ApbsFailureDrillDown.tsx

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useApbsFailureReport, useDateRange, useFailedBeneficiaries } from '../../hooks/useApbsFailureReport';
import { BeneficiaryDetailsDrawer } from './BeneficiaryDetailsDrawer';

type PaymentStage = 'BL' | 'RL' | 'RC' | 'COMPLETED';

interface ExpandedRows {
  [key: string]: boolean;
}

// ✅ Helper function to safely convert to number
const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

export const ApbsFailureDrillDown: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [expandedDates, setExpandedDates] = useState<ExpandedRows>({});
  const [expandedStages, setExpandedStages] = useState<ExpandedRows>({});
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setLast7Days,
    setLast30Days,
    setCurrentMonth,
  } = useDateRange(30);

  const validSelectedStage =
    selectedStage && selectedStage !== ''
      ? (selectedStage as PaymentStage)
      : undefined;

  const { data, loading, error, refetch } = useApbsFailureReport({
    startDate,
    endDate,
    stage: validSelectedStage,
  });

  const toggleDateExpansion = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  const toggleStageExpansion = (key: string) => {
    setExpandedStages((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Group data by date and stage
  const groupedData = React.useMemo(() => {
    if (!data?.dailySummary) return {};

    const grouped: {
      [date: string]: {
        [stage: string]: {
          failedBeneficiaries: number;
          totalFailedAttempts: number;
          reattemptRate: number;
          resolutionRate: number;
        };
      };
    } = {};

    data.dailySummary.forEach((item) => {
      if (!grouped[item.date]) {
        grouped[item.date] = {};
      }

      const reattempt = data.reattemptAnalysis.find(
        (r) => r.date === item.date && r.stage === item.stage
      );
      const resolution = data.resolutionTracking.find(
        (r) => r.date === item.date && r.stage === item.stage
      );

      // ✅ Convert all values to numbers safely
      grouped[item.date][item.stage] = {
        failedBeneficiaries: toNumber(item.failedBeneficiaries),
        totalFailedAttempts: toNumber(item.totalFailedAttempts),
        reattemptRate: toNumber(reattempt?.reattemptRate),
        resolutionRate: toNumber(resolution?.resolutionRate),
      };
    });

    return grouped;
  }, [data]);

  const handleExport = () => {
    console.log('Exporting...');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Data</h3>
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
                APBS Failure Drill-Down
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Detailed breakdown of failures by date and stage
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
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
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

          {/* Date Range Filters */}
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

        {/* Stage Filter */}
        {showFilters && (
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Stage
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedStage('')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStage === ''
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Stages
                </button>
                {['BL', 'RL', 'RC', 'COMPLETED'].map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setSelectedStage(stage)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedStage === stage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <div className="col-span-3">Date / Stage</div>
                <div className="col-span-2 text-center">Failed</div>
                <div className="col-span-2 text-center">Attempts</div>
                <div className="col-span-2 text-center">Re-attempt Rate</div>
                <div className="col-span-2 text-center">Resolution Rate</div>
                <div className="col-span-1 text-center">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedData).map(([date, stages]) => {
                const dateKey = date;
                const isDateExpanded = expandedDates[dateKey];
                const totalFailures = Object.values(stages).reduce(
                  (sum, stage) => sum + stage.failedBeneficiaries,
                  0
                );

                return (
                  <div key={dateKey}>
                    {/* Date Row */}
                    <div
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleDateExpansion(dateKey)}
                    >
                      <div className="col-span-3 flex items-center gap-2">
                        {isDateExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                          {totalFailures}
                        </span>
                      </div>
                      <div className="col-span-2 text-center text-gray-600">
                        {Object.values(stages).reduce(
                          (sum, stage) => sum + stage.totalFailedAttempts,
                          0
                        )}
                      </div>
                      <div className="col-span-2"></div>
                      <div className="col-span-2"></div>
                      <div className="col-span-1"></div>
                    </div>

                    {/* Stage Rows (when date is expanded) */}
                    {isDateExpanded && (
                      <div className="bg-gray-50">
                        {Object.entries(stages).map(([stage, stageData]) => {
                          const stageKey = `${dateKey}-${stage}`;
                          const isStageExpanded = expandedStages[stageKey];

                          return (
                            <div key={stageKey} className="border-t border-gray-200">
                              {/* Stage Row */}
                              <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-white transition-colors">
                                <div className="col-span-3 flex items-center gap-2 pl-8">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                    {stage}
                                  </span>
                                </div>
                                <div className="col-span-2 text-center">
                                  <span className="text-sm font-semibold text-gray-900">
                                    {stageData.failedBeneficiaries}
                                  </span>
                                </div>
                                <div className="col-span-2 text-center">
                                  <span className="text-sm text-gray-600">
                                    {stageData.totalFailedAttempts}
                                  </span>
                                </div>
                                <div className="col-span-2 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="flex-1 max-w-[100px]">
                                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-orange-500"
                                          style={{
                                            width: `${stageData.reattemptRate}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <span className="text-sm font-semibold text-orange-600">
                                      {stageData.reattemptRate.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                                <div className="col-span-2 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="flex-1 max-w-[100px]">
                                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-green-500"
                                          style={{
                                            width: `${stageData.resolutionRate}%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <span className="text-sm font-semibold text-green-600">
                                      {stageData.resolutionRate.toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                                <div className="col-span-1 text-center">
                                  <button
                                    onClick={() => toggleStageExpansion(stageKey)}
                                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                  >
                                    <Users className="w-3 h-3" />
                                    {isStageExpanded ? 'Hide' : 'View'}
                                  </button>
                                </div>
                              </div>

                              {/* Beneficiaries List (when stage is expanded) */}
                              {isStageExpanded && (
                                <BeneficiaryList
                                  date={date}
                                  stage={stage}
                                  onSelectBeneficiary={setSelectedBeneficiary}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {Object.keys(groupedData).length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No failure data available</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your date range or filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Beneficiary Details Drawer */}
      {selectedBeneficiary && (
        <BeneficiaryDetailsDrawer
          beneficiaryId={selectedBeneficiary}
          onClose={() => setSelectedBeneficiary(null)}
        />
      )}
    </div>
  );
};

// Beneficiary List Component
interface BeneficiaryListProps {
  date: string;
  stage: string;
  onSelectBeneficiary: (id: string) => void;
}

const BeneficiaryList: React.FC<BeneficiaryListProps> = ({
  date,
  stage,
  onSelectBeneficiary,
}) => {
  const [page, setPage] = useState(1);
  const { data, loading } = useFailedBeneficiaries({
    startDate: date,
    endDate: date,
    stage: stage as PaymentStage,
    page,
    limit: 10,
  });

  if (loading) {
    return (
      <div className="px-6 py-4 text-center">
        <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="px-6 py-3">
        <div className="space-y-2">
          {data?.beneficiaries.map((beneficiary) => (
            <div
              key={beneficiary.beneficiaryId}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => onSelectBeneficiary(beneficiary.beneficiaryId)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {beneficiary.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {beneficiary.beneficiaryId}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Response Code</div>
                      <div className="font-mono font-semibold text-gray-900">
                        {beneficiary.responseCode}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Attempts</div>
                      <div className="font-semibold text-orange-600">
                        {beneficiary.attemptCount}
                      </div>
                    </div>
                    <div>
                      {beneficiary.wasResolved ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>
                {beneficiary.rejectionReason && (
                  <p className="text-xs text-red-600 mt-1 line-clamp-1">
                    {beneficiary.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Page {page} of {data.pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === data.pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};