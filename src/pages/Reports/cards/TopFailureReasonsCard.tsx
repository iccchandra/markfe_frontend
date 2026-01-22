// src/components/cards/TopFailureReasonsCard.tsx

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FailureReasonSummary } from '@/services/apbs-failure-report.api';

interface TopFailureReasonsCardProps {
  data: FailureReasonSummary[];
}

export const TopFailureReasonsCard: React.FC<TopFailureReasonsCardProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Top Failure Reasons
        </h3>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <div
            key={index}
            className="p-3 border border-gray-200 rounded-lg hover:border-red-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-mono bg-gray-100 text-gray-800 rounded">
                    {item.responseCode}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.count} beneficiaries
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {item.rejectionReason || 'No reason provided'}
                </p>
              </div>
              <span className="ml-3 text-lg font-bold text-red-600">
                {item.percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No failure reasons available
        </div>
      )}
    </div>
  );
};