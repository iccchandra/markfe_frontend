// ============================================================================
// DASHBOARD METRICS COMPONENT
// src/components/FileTracking/FileTrackingDashboard.tsx
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  Send,
  Inbox,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { fileTrackingService, DashboardMetrics } from '../../services/fileTrackingService';

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color,
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trend.isPositive ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {Math.abs(trend.value)}%
              </span>
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const FileTrackingDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fileTrackingService.getDashboardMetrics();
      setMetrics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch metrics');
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-medium text-red-800">Failed to load metrics</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">
            File tracking metrics and performance indicators
          </p>
        </div>
        <button
          onClick={fetchMetrics}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Quick Stats - This Month */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          This Month
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Files Sent"
            value={metrics.filesSentThisMonth}
            subtitle="request files to bank"
            icon={Send}
            color="blue"
          />
          
          <MetricCard
            title="Files Received"
            value={metrics.filesReceivedThisMonth}
            subtitle="response files from bank"
            icon={Inbox}
            color="green"
          />
          
          <MetricCard
            title="Completion Rate"
            value={`${metrics.completionRate.toFixed(1)}%`}
            subtitle="received / sent"
            icon={CheckCircle}
            color={metrics.completionRate >= 95 ? 'green' : 'yellow'}
          />
          
          <MetricCard
            title="Avg Turnaround"
            value={`${metrics.avgTurnaroundDays.toFixed(1)}`}
            subtitle="days (last 30 days)"
            icon={Clock}
            color={
              metrics.avgTurnaroundDays <= 2
                ? 'green'
                : metrics.avgTurnaroundDays <= 4
                ? 'yellow'
                : 'red'
            }
          />
        </div>
      </div>

      {/* This Week Stats */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          This Week
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MetricCard
            title="Files Sent"
            value={metrics.filesSentThisWeek}
            subtitle="last 7 days"
            icon={Send}
            color="indigo"
          />
          
          <MetricCard
            title="Files Received"
            value={metrics.filesReceivedThisWeek}
            subtitle="last 7 days"
            icon={Inbox}
            color="purple"
          />
          
          <MetricCard
            title="Pending Dates"
            value={metrics.totalPendingDates}
            subtitle="awaiting response"
            icon={AlertTriangle}
            color={metrics.totalPendingDates > 5 ? 'red' : 'yellow'}
          />
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Performance Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Turnaround Time</span>
              <span
                className={`text-sm font-semibold ${
                  metrics.avgTurnaroundDays <= 2
                    ? 'text-green-600'
                    : metrics.avgTurnaroundDays <= 4
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {metrics.avgTurnaroundDays <= 2
                  ? '🟢 Excellent'
                  : metrics.avgTurnaroundDays <= 4
                  ? '🟡 Good'
                  : '🔴 Needs Improvement'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metrics.avgTurnaroundDays <= 2
                    ? 'bg-green-500'
                    : metrics.avgTurnaroundDays <= 4
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min((metrics.avgTurnaroundDays / 7) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              Average: {metrics.avgTurnaroundDays.toFixed(1)} days
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span
                className={`text-sm font-semibold ${
                  metrics.completionRate >= 95
                    ? 'text-green-600'
                    : metrics.completionRate >= 80
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {metrics.completionRate >= 95
                  ? '🟢 Excellent'
                  : metrics.completionRate >= 80
                  ? '🟡 Good'
                  : '🔴 Needs Improvement'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metrics.completionRate >= 95
                    ? 'bg-green-500'
                    : metrics.completionRate >= 80
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${metrics.completionRate}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {metrics.completionRate.toFixed(1)}% of files received
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending Status</span>
              <span
                className={`text-sm font-semibold ${
                  metrics.totalPendingDates === 0
                    ? 'text-green-600'
                    : metrics.totalPendingDates <= 3
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}
              >
                {metrics.totalPendingDates === 0
                  ? '🟢 All Clear'
                  : metrics.totalPendingDates <= 3
                  ? '🟡 Monitor'
                  : '🔴 Action Required'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metrics.totalPendingDates === 0
                    ? 'bg-green-500'
                    : metrics.totalPendingDates <= 3
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${Math.min((metrics.totalPendingDates / 10) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {metrics.totalPendingDates} dates awaiting response
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(metrics.totalPendingDates > 5 || metrics.completionRate < 80 || metrics.avgTurnaroundDays > 5) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">
                Action Required
              </h3>
              <ul className="space-y-1 text-sm text-yellow-800">
                {metrics.totalPendingDates > 5 && (
                  <li>• {metrics.totalPendingDates} dates have pending files - follow up with bank</li>
                )}
                {metrics.completionRate < 80 && (
                  <li>• Completion rate is below 80% - check for missing responses</li>
                )}
                {metrics.avgTurnaroundDays > 5 && (
                  <li>• Turnaround time exceeds 5 days - review processing delays</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileTrackingDashboard;