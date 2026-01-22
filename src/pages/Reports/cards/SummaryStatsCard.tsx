// src/components/cards/SummaryStatsCard.tsx

import React from 'react';
import { Users, AlertCircle, RefreshCw, CheckCircle, Clock } from 'lucide-react';

interface SummaryStatsCardProps {
  summary: {
    totalPeriodFailures: number;
    totalUniqueBeneficiaries: number;
    overallReattemptRate: number;
    overallResolutionRate: number;
    averageDaysToResolution: number;
  };
}

export const SummaryStatsCard: React.FC<SummaryStatsCardProps> = ({ summary }) => {
  // ✅ Safely convert to number and format
  const formatNumber = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined) return '0';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '0' : numValue.toFixed(1);
  };

  const stats = [
    {
      label: 'Total Failures',
      value: (summary.totalPeriodFailures || 0).toLocaleString(),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Unique Beneficiaries',
      value: (summary.totalUniqueBeneficiaries || 0).toLocaleString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Re-attempt Rate',
      value: `${formatNumber(summary.overallReattemptRate)}%`,
      icon: RefreshCw,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      label: 'Resolution Rate',
      value: `${formatNumber(summary.overallResolutionRate)}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Avg Days to Resolution',
      value: formatNumber(summary.averageDaysToResolution), // ✅ Fixed
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stat.value}
          </div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};