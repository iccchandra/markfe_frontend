// src/components/cards/DailySummaryCard.tsx

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DailyFailureSummary } from '@/services/apbs-failure-report.api';

interface DailySummaryCardProps {
  data: DailyFailureSummary[];
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ data }) => {
  const getTrendIcon = (change: number | null) => {
    if (change === null || change === 0) return <Minus className="w-4 h-4 text-gray-400" />;
    if (change > 0) return <TrendingUp className="w-4 h-4 text-red-500" />;
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  };

  const getTrendColor = (change: number | null) => {
    if (change === null || change === 0) return 'text-gray-600';
    if (change > 0) return 'text-red-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Daily Failure Summary
      </h3>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data.slice(0, 10).map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                  {item.stage}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {item.totalFailedAttempts} attempts
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {item.failedBeneficiaries}
                </div>
                <div className="text-xs text-gray-500">beneficiaries</div>
              </div>

              {item.changeFromPreviousDay !== null && (
                <div className={`flex items-center gap-1 ${getTrendColor(item.changeFromPreviousDay)}`}>
                  {getTrendIcon(item.changeFromPreviousDay)}
                  <span className="text-sm font-medium">
                    {Math.abs(item.changeFromPreviousDay)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No data available for the selected period
        </div>
      )}
    </div>
  );
};