import React from 'react';
import { Users, DollarSign, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { Summary } from '@/services/payRecordsApi.service';

interface SummaryCardsProps {
  summary: Summary | null;
  loading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, loading }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const cards = [
    {
      title: 'Total Records',
      value: summary.total_records.toLocaleString(),
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Unique Beneficiaries',
      value: summary.unique_beneficiaries.toLocaleString(),
      icon: Users,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Success Amount',
      value: formatCurrency(summary.total_success_amount_rupees),
      subtitle: `${summary.success_count.toLocaleString()} payments`,
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      valueColor: 'text-green-600',
    },
    {
      title: 'Failed Amount',
      value: formatCurrency(summary.total_failed_amount_rupees),
      subtitle: `${summary.failure_count.toLocaleString()} payments`,
      icon: XCircle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      valueColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
              <p className={`text-2xl font-bold ${card.valueColor || 'text-gray-900'}`}>
                {card.value}
              </p>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
            <div className={`${card.bgColor} p-3 rounded-full`}>
              <card.icon className={card.iconColor} size={24} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
