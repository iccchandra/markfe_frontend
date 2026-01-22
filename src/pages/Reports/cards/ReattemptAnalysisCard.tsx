// src/components/cards/ReattemptAnalysisCard.tsx

import React, { useState } from 'react';
import { RefreshCw, TrendingUp, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { ReattemptAnalysis } from '@/services/apbs-failure-report.api';

interface ReattemptAnalysisCardProps {
  data: ReattemptAnalysis[];
}

export const ReattemptAnalysisCard: React.FC<ReattemptAnalysisCardProps> = ({ data }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getReattemptRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getReattemptRateBgColor = (rate: number) => {
    if (rate >= 70) return 'bg-green-500';
    if (rate >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const calculateStats = () => {
    if (data.length === 0) return null;

    const totalFailed = data.reduce((sum, item) => sum + item.totalFailed, 0);
    const totalReattempted = data.reduce((sum, item) => sum + item.reattemptedCount, 0);
    const totalNextDay = data.reduce((sum, item) => sum + item.reattemptedNextDay, 0);
    const avgRate = data.reduce((sum, item) => sum + item.reattemptRate, 0) / data.length;

    return {
      totalFailed,
      totalReattempted,
      totalNextDay,
      avgRate: avgRate.toFixed(2),
    };
  };

  const stats = calculateStats();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <RefreshCw className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Re-attempt Analysis
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Track how many failures were re-attempted
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-orange-100 text-orange-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'chart'
                  ? 'bg-orange-100 text-orange-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Chart
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Total Failed</div>
              <div className="text-xl font-bold text-gray-900">
                {stats.totalFailed.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Re-attempted</div>
              <div className="text-xl font-bold text-orange-600">
                {stats.totalReattempted.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Next Day</div>
              <div className="text-xl font-bold text-purple-600">
                {stats.totalNextDay.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Avg Rate</div>
              <div className="text-xl font-bold text-blue-600">
                {stats.avgRate}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {data.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No re-attempt data available</p>
            <p className="text-sm text-gray-400 mt-1">
              Data will appear when failures are re-attempted
            </p>
          </div>
        ) : viewMode === 'list' ? (
          // List View
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 hover:shadow-sm transition-all"
              >
                {/* Main Row */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(item.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                          {item.stage}
                        </span>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center gap-4 ml-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>{item.reattemptedCount} reattempted</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.reattemptedNextDay} next day</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${getReattemptRateColor(item.reattemptRate)}`}>
                        {item.reattemptRate}%
                      </span>
                      {expandedIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Compact Progress Bar */}
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${getReattemptRateBgColor(item.reattemptRate)} transition-all duration-500`}
                      style={{ width: `${item.reattemptRate}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedIndex === index && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="pt-4 grid grid-cols-3 gap-4">
                      {/* Total Failed */}
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="text-xs text-gray-500 mb-1 font-medium">
                          Total Failed
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {item.totalFailed}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          beneficiaries
                        </div>
                      </div>

                      {/* Re-attempted */}
                      <div className="bg-white p-3 rounded-lg border border-orange-200">
                        <div className="text-xs text-orange-600 mb-1 font-medium">
                          Re-attempted
                        </div>
                        <div className="text-2xl font-bold text-orange-600">
                          {item.reattemptedCount}
                        </div>
                        <div className="text-xs text-orange-400 mt-1">
                          of {item.totalFailed} ({((item.reattemptedCount / item.totalFailed) * 100).toFixed(1)}%)
                        </div>
                      </div>

                      {/* Next Day Re-attempts */}
                      <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <div className="text-xs text-purple-600 mb-1 font-medium">
                          Next Day
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {item.reattemptedNextDay}
                        </div>
                        <div className="text-xs text-purple-400 mt-1">
                          {item.reattemptedCount > 0
                            ? `${((item.reattemptedNextDay / item.reattemptedCount) * 100).toFixed(1)}% of reattempts`
                            : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Visual Breakdown */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24 text-xs text-gray-600 font-medium">
                          Re-attempted:
                        </div>
                        <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
                          <div
                            className="h-full bg-orange-500 flex items-center justify-end pr-2"
                            style={{ width: `${(item.reattemptedCount / item.totalFailed) * 100}%` }}
                          >
                            <span className="text-xs font-semibold text-white">
                              {item.reattemptedCount}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-24 text-xs text-gray-600 font-medium">
                          Not Reattempted:
                        </div>
                        <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
                          <div
                            className="h-full bg-gray-400 flex items-center justify-end pr-2"
                            style={{
                              width: `${((item.totalFailed - item.reattemptedCount) / item.totalFailed) * 100}%`,
                            }}
                          >
                            <span className="text-xs font-semibold text-white">
                              {item.totalFailed - item.reattemptedCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Chart View
          <div className="space-y-4">
            <div className="max-h-[500px] overflow-y-auto pr-2">
              {data.map((item, index) => (
                <div
                  key={index}
                  className="mb-6 last:mb-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(item.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                        {item.stage}
                      </span>
                    </div>
                    <span className={`text-sm font-bold ${getReattemptRateColor(item.reattemptRate)}`}>
                      {item.reattemptRate}%
                    </span>
                  </div>

                  {/* Stacked Bar Chart */}
                  <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {/* Re-attempted */}
                    <div
                      className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-500 flex items-center justify-center"
                      style={{ width: `${(item.reattemptedCount / item.totalFailed) * 100}%` }}
                    >
                      {item.reattemptedCount > 0 && (
                        <span className="text-xs font-semibold text-white px-2">
                          {item.reattemptedCount} reattempted
                        </span>
                      )}
                    </div>

                    {/* Not Re-attempted */}
                    <div
                      className="absolute top-0 h-full bg-gray-300 transition-all duration-500 flex items-center justify-center"
                      style={{
                        left: `${(item.reattemptedCount / item.totalFailed) * 100}%`,
                        width: `${((item.totalFailed - item.reattemptedCount) / item.totalFailed) * 100}%`,
                      }}
                    >
                      {(item.totalFailed - item.reattemptedCount) > 0 && (
                        <span className="text-xs font-semibold text-gray-700 px-2">
                          {item.totalFailed - item.reattemptedCount} not reattempted
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Total: {item.totalFailed}</span>
                    <span className="text-purple-600 font-medium">
                      {item.reattemptedNextDay} next day
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded" />
                <span className="text-sm text-gray-600">Re-attempted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded" />
                <span className="text-sm text-gray-600">Not Re-attempted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded" />
                <span className="text-sm text-gray-600">Next Day Re-attempt</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};