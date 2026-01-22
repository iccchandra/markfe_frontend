// src/pages/Reports/ApbsCumulativeFailureDrillDown.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  Users,
  Plus,
  Minus,
  Clock,
} from 'lucide-react';
import { useApbsFailureReport, useDateRange } from '../../hooks/useApbsFailureReport';

type PaymentStage = 'BL' | 'RL' | 'RC' | 'COMPLETED';

interface ExpandedRows {
  [key: string]: boolean;
}

interface StageData {
  newFailures: number;
  retriedFromPrevious: number;
  successfulRetries: number;
  stillFailedRetries: number;
  netChange: number;
  cumulativeFailures: number;
}

interface DateData {
  [stage: string]: StageData;
}

interface GroupedDataWithTotals {
  [date: string]: {
    stages: DateData;
    dateLevelCumulative: number;
  };
}

const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

export const ApbsCumulativeFailureDrillDown: React.FC = () => {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [expandedDates, setExpandedDates] = useState<ExpandedRows>({});
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

  // Handle cumulative click to navigate to beneficiary details
  const handleCumulativeClick = (date: string, stage?: string) => {
    const isBeforePeriod = date.startsWith('Before') || date === 'Historical';
    
    navigate('/reports/apbs-failures/beneficiaries', {
      state: {
        date: isBeforePeriod ? null : date,
        startDate: isBeforePeriod ? null : startDate,
        endDate: isBeforePeriod ? startDate : date,
        stage: stage || selectedStage || undefined,
      },
    });
  };

  // Group cumulative data by date and calculate date-level cumulatives
  const groupedData = React.useMemo(() => {
    if (!data?.cumulativeTracking || data.cumulativeTracking.length === 0) {
      console.log('No cumulative tracking data available');
      return {};
    }

    // First, organize by date and stage
    const byDate: { [date: string]: DateData } = {};
    const stageBaselines: { [stage: string]: number } = {};

    data.cumulativeTracking.forEach((item) => {
      // Capture baseline values
      if (item.date.startsWith('Before')) {
        stageBaselines[item.stage] = toNumber(item.cumulativeFailures);
      }

      if (!byDate[item.date]) {
        byDate[item.date] = {};
      }

      byDate[item.date][item.stage] = {
        newFailures: toNumber(item.newFailures),
        retriedFromPrevious: toNumber(item.retriedFromPrevious),
        successfulRetries: toNumber(item.successfulRetries),
        stillFailedRetries: toNumber(item.stillFailedRetries),
        netChange: toNumber(item.netChange),
        cumulativeFailures: toNumber(item.cumulativeFailures),
      };
    });

    // Calculate total baseline across all stages
    const totalBaseline = Object.values(stageBaselines).reduce((sum, val) => sum + val, 0);

    // Sort dates chronologically (oldest first)
    const sortedDates = Object.keys(byDate).sort((a, b) => {
      const isBeforeA = a.startsWith('Before');
      const isBeforeB = b.startsWith('Before');
      
      if (isBeforeA && isBeforeB) return 0;
      if (isBeforeA) return -1; // Before dates first
      if (isBeforeB) return 1;
      
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // Calculate date-level cumulative by walking through dates chronologically
    const result: GroupedDataWithTotals = {};
    let runningCumulative = 0;

    sortedDates.forEach((date) => {
      const stages = byDate[date];
      const isBeforePeriod = date.startsWith('Before');

      if (isBeforePeriod) {
        // For baseline, the cumulative IS the total baseline
        runningCumulative = totalBaseline;
      } else {
        // For regular dates, add the net change to running total
        const dateNetChange = Object.values(stages).reduce(
          (sum, stageData) => sum + stageData.netChange,
          0
        );
        runningCumulative += dateNetChange;
      }

      result[date] = {
        stages,
        dateLevelCumulative: runningCumulative,
      };
    });

    return result;
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
                APBS Cumulative Failure Tracking
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Track running failure count with daily additions and resolutions
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

      {/* Legend */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How to Read This Report:</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs text-blue-800">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Baseline:</strong> Pending failures before selected period
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Plus className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>New Failures:</strong> First-time failures on this day
              </div>
            </div>
            <div className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Retried:</strong> Previous failures attempted again
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Minus className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Resolved:</strong> Retries that succeeded
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Cumulative:</strong> Total pending failures (click to view details)
              </div>
            </div>
          </div>
        </div>
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
                <div className="col-span-2">Date / Stage</div>
                <div className="col-span-2 text-center">New Failures</div>
                <div className="col-span-2 text-center">Retried</div>
                <div className="col-span-2 text-center">Resolved</div>
                <div className="col-span-2 text-center">Net Change</div>
                <div className="col-span-2 text-center">Cumulative Total</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {Object.entries(groupedData)
                .sort(([dateA], [dateB]) => {
                  const isBeforeA = dateA.startsWith('Before') || dateA === 'Historical';
                  const isBeforeB = dateB.startsWith('Before') || dateB === 'Historical';

                  if (isBeforeA && isBeforeB) return 0;
                  if (isBeforeA) return 1;
                  if (isBeforeB) return -1;

                  return new Date(dateB).getTime() - new Date(dateA).getTime();
                })
                .map(([date, dateData]) => {
                  const dateKey = date;
                  const isDateExpanded = expandedDates[dateKey];
                  const isBeforePeriod = date.startsWith('Before') || date === 'Historical';
                  const stages = dateData.stages;

                  // Calculate date-level totals for the metrics
                  const dateTotals = Object.values(stages).reduce(
                    (acc, stageData) => ({
                      newFailures: acc.newFailures + stageData.newFailures,
                      retriedFromPrevious: acc.retriedFromPrevious + stageData.retriedFromPrevious,
                      successfulRetries: acc.successfulRetries + stageData.successfulRetries,
                      netChange: acc.netChange + stageData.netChange,
                    }),
                    { newFailures: 0, retriedFromPrevious: 0, successfulRetries: 0, netChange: 0 }
                  );

                  // Use the pre-calculated date-level cumulative
                  const dateLevelCumulative = dateData.dateLevelCumulative;

                  return (
                    <div key={dateKey}>
                      {/* Date Row */}
                      <div
                        className={`grid grid-cols-12 gap-4 px-6 py-4 transition-colors ${
                          isBeforePeriod
                            ? 'bg-blue-50 border-t-2 border-blue-200 font-semibold'
                            : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                        onClick={() => !isBeforePeriod && toggleDateExpansion(dateKey)}
                      >
                        <div className="col-span-2 flex items-center gap-2">
                          {!isBeforePeriod && (
                            isDateExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            )
                          )}
                          {isBeforePeriod ? (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-bold text-blue-900">{date}</span>
                            </div>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <span className="font-semibold text-gray-900 text-sm">
                                {new Date(date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Show only cumulative for "Before Period" rows */}
                        {isBeforePeriod ? (
                          <>
                            <div className="col-span-2 text-center">
                              <span className="text-sm text-gray-400">—</span>
                            </div>
                            <div className="col-span-2 text-center">
                              <span className="text-sm text-gray-400">—</span>
                            </div>
                            <div className="col-span-2 text-center">
                              <span className="text-sm text-gray-400">—</span>
                            </div>
                            <div className="col-span-2 text-center">
                              <span className="text-sm text-gray-400">—</span>
                            </div>
                            <div className="col-span-2 text-center">
                              <button
                                onClick={() => handleCumulativeClick(date)}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-base font-bold rounded-full shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                              >
                                <Users className="w-4 h-4" />
                                {dateLevelCumulative.toLocaleString()}
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="col-span-2 text-center">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded-full">
                                <Plus className="w-3 h-3" />
                                {dateTotals.newFailures}
                              </span>
                            </div>

                            <div className="col-span-2 text-center">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm font-semibold rounded-full">
                                <RefreshCw className="w-3 h-3" />
                                {dateTotals.retriedFromPrevious}
                              </span>
                            </div>

                            <div className="col-span-2 text-center">
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                                <Minus className="w-3 h-3" />
                                {dateTotals.successfulRetries}
                              </span>
                            </div>

                            <div className="col-span-2 text-center">
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full ${
                                  dateTotals.netChange > 0
                                    ? 'bg-red-100 text-red-800'
                                    : dateTotals.netChange < 0
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {dateTotals.netChange > 0 ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : dateTotals.netChange < 0 ? (
                                  <TrendingDown className="w-3 h-3" />
                                ) : null}
                                {dateTotals.netChange > 0 ? '+' : ''}
                                {dateTotals.netChange}
                              </span>
                            </div>

                            <div className="col-span-2 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent date expansion
                                  handleCumulativeClick(date);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm font-bold rounded-full hover:bg-purple-200 transition-colors cursor-pointer"
                              >
                                <Users className="w-3 h-3" />
                                {dateLevelCumulative.toLocaleString()}
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Stage Rows (when date is expanded) - Don't expand "Before Period" */}
                      {isDateExpanded && !isBeforePeriod && (
                        <div className="bg-gray-50">
                          {Object.entries(stages).map(([stage, stageData]) => (
                            <div key={`${dateKey}-${stage}`} className="border-t border-gray-200">
                              <div className="grid grid-cols-12 gap-4 px-6 py-3 hover:bg-white transition-colors">
                                <div className="col-span-2 flex items-center gap-2 pl-8">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                                    {stage}
                                  </span>
                                </div>

                                <div className="col-span-2 text-center">
                                  <div className="text-sm font-semibold text-red-600">
                                    +{stageData.newFailures}
                                  </div>
                                  <div className="text-xs text-gray-500">new</div>
                                </div>

                                <div className="col-span-2 text-center">
                                  <div className="text-sm font-semibold text-orange-600">
                                    {stageData.retriedFromPrevious}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ({stageData.stillFailedRetries} still failed)
                                  </div>
                                </div>

                                <div className="col-span-2 text-center">
                                  <div className="text-sm font-semibold text-green-600">
                                    -{stageData.successfulRetries}
                                  </div>
                                  <div className="text-xs text-gray-500">resolved</div>
                                </div>

                                <div className="col-span-2 text-center">
                                  <div
                                    className={`text-sm font-bold ${
                                      stageData.netChange > 0
                                        ? 'text-red-600'
                                        : stageData.netChange < 0
                                        ? 'text-green-600'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {stageData.netChange > 0 ? '+' : ''}
                                    {stageData.netChange}
                                  </div>
                                  <div className="text-xs text-gray-500">net</div>
                                </div>

                                <div className="col-span-2 text-center">
                                  <button
                                    onClick={() => handleCumulativeClick(date, stage)}
                                    className="text-lg font-bold text-purple-600 hover:text-purple-800 cursor-pointer hover:underline"
                                  >
                                    {stageData.cumulativeFailures.toLocaleString()}
                                  </button>
                                  <div className="text-xs text-gray-500">pending</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* For "Before Period", always show stages expanded */}
                      {isBeforePeriod && (
                        <div className="bg-blue-50 border-t-2 border-blue-200">
                          {Object.entries(stages).map(([stage, stageData]) => (
                            <div key={`${dateKey}-${stage}`} className="border-t border-blue-100">
                              <div className="grid grid-cols-12 gap-4 px-6 py-3">
                                <div className="col-span-2 flex items-center gap-2 pl-8">
                                  <span className="px-2 py-1 bg-blue-200 text-blue-900 text-xs font-bold rounded">
                                    {stage}
                                  </span>
                                </div>

                                <div className="col-span-2 text-center">
                                  <span className="text-sm text-gray-400">—</span>
                                </div>

                                <div className="col-span-2 text-center">
                                  <span className="text-sm text-gray-400">—</span>
                                </div>

                                <div className="col-span-2 text-center">
                                  <span className="text-sm text-gray-400">—</span>
                                </div>

                                <div className="col-span-2 text-center">
                                  <span className="text-sm text-gray-400">—</span>
                                </div>

                                <div className="col-span-2 text-center">
                                  <button
                                    onClick={() => handleCumulativeClick(date, stage)}
                                    className="text-lg font-bold text-blue-900 hover:text-blue-700 cursor-pointer hover:underline"
                                  >
                                    {stageData.cumulativeFailures.toLocaleString()}
                                  </button>
                                  <div className="text-xs text-blue-600">baseline</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {Object.keys(groupedData).length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No data available</p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your date range or filters
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};