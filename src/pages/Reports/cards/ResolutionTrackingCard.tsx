// src/pages/Reports/cards/ResolutionTrackingCard.tsx

import React, { useState } from 'react';
import { CheckCircle, TrendingUp, Clock, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { ResolutionTracking } from '@/services/apbs-failure-report.api';

interface ResolutionTrackingCardProps {
  data: ResolutionTracking[];
}

export const ResolutionTrackingCard: React.FC<ResolutionTrackingCardProps> = ({ data }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getResolutionRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResolutionRateBgColor = (rate: number) => {
    if (rate >= 70) return 'bg-green-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const calculateStats = () => {
    if (data.length === 0) return null;

    const totalFailed = data.reduce((sum, item) => sum + item.totalFailed, 0);
    const totalResolved = data.reduce((sum, item) => sum + item.resolvedSuccessfully, 0);
    const totalNextDay = data.reduce((sum, item) => sum + item.resolvedNextDay, 0);
    const totalPending = data.reduce((sum, item) => sum + item.stillPending, 0);
    const avgRate = data.reduce((sum, item) => sum + item.resolutionRate, 0) / data.length;

    return {
      totalFailed,
      totalResolved,
      totalNextDay,
      totalPending,
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
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Resolution Tracking
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Monitor how failures get resolved over time
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-5 gap-3 mt-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Total Failed</div>
              <div className="text-xl font-bold text-gray-900">
                {stats.totalFailed.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Resolved</div>
              <div className="text-xl font-bold text-green-600">
                {stats.totalResolved.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Next Day</div>
              <div className="text-xl font-bold text-blue-600">
                {stats.totalNextDay.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Pending</div>
              <div className="text-xl font-bold text-red-600">
                {stats.totalPending.toLocaleString()}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Avg Rate</div>
              <div className="text-xl font-bold text-emerald-600">
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
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No resolution data available</p>
            <p className="text-sm text-gray-400 mt-1">
              Data will appear when failures are resolved
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {data.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-green-300 hover:shadow-sm transition-all"
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
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          <span>{item.resolvedSuccessfully} resolved</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          <span>{item.stillPending} pending</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-2xl font-bold ${getResolutionRateColor(item.resolutionRate)}`}>
                        {item.resolutionRate}%
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
                      className={`absolute top-0 left-0 h-full ${getResolutionRateBgColor(item.resolutionRate)} transition-all duration-500`}
                      style={{ width: `${item.resolutionRate}%` }}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedIndex === index && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="pt-4 grid grid-cols-4 gap-3">
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

                      {/* Resolved Successfully */}
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <div className="text-xs text-green-600 mb-1 font-medium">
                          Resolved
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {item.resolvedSuccessfully}
                        </div>
                        <div className="text-xs text-green-400 mt-1">
                          {item.totalFailed > 0
                            ? `${((item.resolvedSuccessfully / item.totalFailed) * 100).toFixed(1)}%`
                            : 'N/A'}
                        </div>
                      </div>

                      {/* Next Day Resolution */}
                      <div className="bg-white p-3 rounded-lg border border-blue-200">
                        <div className="text-xs text-blue-600 mb-1 font-medium">
                          Next Day
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {item.resolvedNextDay}
                        </div>
                        <div className="text-xs text-blue-400 mt-1">
                          {item.resolvedSuccessfully > 0
                            ? `${((item.resolvedNextDay / item.resolvedSuccessfully) * 100).toFixed(1)}% of resolved`
                            : 'N/A'}
                        </div>
                      </div>

                      {/* Still Pending */}
                      <div className="bg-white p-3 rounded-lg border border-red-200">
                        <div className="text-xs text-red-600 mb-1 font-medium">
                          Still Pending
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          {item.stillPending}
                        </div>
                        <div className="text-xs text-red-400 mt-1">
                          {item.totalFailed > 0
                            ? `${((item.stillPending / item.totalFailed) * 100).toFixed(1)}%`
                            : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Visual Breakdown */}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24 text-xs text-gray-600 font-medium">
                          Resolved:
                        </div>
                        <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
                          <div
                            className="h-full bg-green-500 flex items-center justify-end pr-2"
                            style={{ width: `${(item.resolvedSuccessfully / item.totalFailed) * 100}%` }}
                          >
                            {item.resolvedSuccessfully > 0 && (
                              <span className="text-xs font-semibold text-white">
                                {item.resolvedSuccessfully}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-24 text-xs text-gray-600 font-medium">
                          Pending:
                        </div>
                        <div className="flex-1 h-6 bg-gray-200 rounded overflow-hidden">
                          <div
                            className="h-full bg-red-500 flex items-center justify-end pr-2"
                            style={{ width: `${(item.stillPending / item.totalFailed) * 100}%` }}
                          >
                            {item.stillPending > 0 && (
                              <span className="text-xs font-semibold text-white">
                                {item.stillPending}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Badge */}
                    {item.resolutionRate >= 70 && (
                      <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <Award className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">
                          Excellent resolution rate!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};