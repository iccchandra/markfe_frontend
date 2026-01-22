import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  AlertCircle,
  FileText,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  TrendingUp,
} from 'lucide-react';

import BeneficiaryDetailsModal from './BeneficiaryDetailsModal';
import { DateWiseFilters, DateWiseData, SummaryData, mdApprovalApi } from '../../services/mdapproval.api.service';

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getLast30Days = (): { start: string; end: string } => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    start: formatDate(start),
    end: formatDate(end),
  };
};

const formatIndianDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// ============================================
// STAT CARD COMPONENT
// ============================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600',
    green: 'bg-green-50 border-green-200 text-green-600',
    red: 'bg-red-50 border-red-200 text-red-600',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600',
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    gray: 'bg-gray-50 border-gray-200 text-gray-600',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// ============================================
// DATE FILTER COMPONENT
// ============================================

interface DateFilterProps {
  filters: DateWiseFilters;
  onFiltersChange: (filters: DateWiseFilters) => void;
  onApply: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  filters,
  onFiltersChange,
  onApply,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const stages = ['PENNY_DROP', 'BL', 'RL', 'RC', 'COMPLETED'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Filters</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage
            </label>
            <select
              value={filters.stage || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  stage: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Stages</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District
            </label>
            <input
              type="text"
              value={filters.district || ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, district: e.target.value })
              }
              placeholder="Enter district"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-4 flex gap-2">
            <button
              onClick={onApply}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={() => {
                onFiltersChange({});
                onApply();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// DAILY DATA TABLE COMPONENT
// ============================================

interface DailyDataTableProps {
  data: DateWiseData[];
  onViewDetails: (date: string) => void;
  onFailedClick: (date: string, count: number) => void;
  onNotPresentedClick: (date: string, count: number) => void;
}

const DailyDataTable: React.FC<DailyDataTableProps> = ({ 
  data, 
  onViewDetails, 
  onFailedClick,
  onNotPresentedClick 
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (date: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DATE
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                APPROVED
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PAID (SUCCESS)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                PAID AMOUNT
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                FAILED
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                NOT PRESENTED
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row) => {
              const successCount = row.bankPayment?.success?.count || 0;
              const totalRecords = row.totalRecords || 0;
              const successRate = totalRecords > 0 
                ? ((successCount / totalRecords) * 100).toFixed(2)
                : '0.00';

              return (
                <React.Fragment key={row.date}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatIndianDate(row.date)}
                    </td>
                    
                    {/* APPROVED - NO PERCENTAGE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {(row.mdApproval?.approved || 0).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    
                    {/* PAID (SUCCESS) - COUNT AND PERCENTAGE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">
                          {(row.bankPayment?.success?.count || 0).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({successRate}%)
                        </span>
                      </div>
                    </td>
                    
                    {/* PAID AMOUNT - SEPARATE COLUMN */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {row.bankPayment?.success?.amountFormatted || '₹0.00'}
                    </td>
                    
                    {/* BANK FAILED - COUNT ONLY - CLICKABLE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(row.bankPayment?.failed?.count || 0) > 0 ? (
                        <button
                          onClick={() => onFailedClick(row.date, row.bankPayment?.failed?.count || 0)}
                          className="flex items-center gap-2 hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600 hover:underline">
                            {(row.bankPayment?.failed?.count || 0).toLocaleString()}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">
                            {(row.bankPayment?.failed?.count || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </td>
                    
                    {/* NOT PRESENTED - COUNT ONLY - CLICKABLE */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(row.bankPayment?.notPresented?.count || 0) > 0 ? (
                        <button
                          onClick={() => onNotPresentedClick(row.date, row.bankPayment?.notPresented?.count || 0)}
                          className="flex items-center gap-2 hover:bg-orange-50 px-2 py-1 rounded transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-orange-600 hover:underline">
                            {(row.bankPayment?.notPresented?.count || 0).toLocaleString()}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-orange-600">
                            {(row.bankPayment?.notPresented?.count || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => toggleRow(row.date)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                      >
                        {expandedRows.has(row.date) ? 'Hide' : 'View'} Details
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>

                  {/* EXPANDABLE DETAILS ROW */}
                  {expandedRows.has(row.date) && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* MD Approval Details */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              MD Approval
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Approved:</span>
                                <span className="font-medium">
                                  {(row.mdApproval?.approved || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Rejected:</span>
                                <span className="font-medium">
                                  {(row.mdApproval?.rejected || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Pending:</span>
                                <span className="font-medium">
                                  {(row.mdApproval?.pending || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t">
                                <span className="text-gray-600">Approval Rate:</span>
                                <span className="font-medium text-green-600">
                                  {row.mdApproval?.approvalRate || '0%'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bank Payment Details */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <CreditCard className="w-4 h-4 mr-2 text-blue-500" />
                              Bank Payment
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Success:</span>
                                <span className="font-medium text-green-600">
                                  {(row.bankPayment?.success?.count || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-medium text-green-600">
                                  {row.bankPayment?.success?.amountFormatted || '₹0.00 Cr'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Failed:</span>
                                <span className="font-medium text-red-600">
                                  {(row.bankPayment?.failed?.count || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t">
                                <span className="text-gray-600">Success Rate:</span>
                                <span className="font-medium">
                                  {row.bankPayment?.successRate || '0%'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Presentation Status */}
                          <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                              <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                              Presentation Status
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Presented:</span>
                                <span className="font-medium">
                                  {(row.bankPayment?.presented?.count || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-medium">
                                  {row.bankPayment?.presented?.amountFormatted || '₹0.00 Cr'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Not Presented:</span>
                                <span className="font-medium text-orange-600">
                                  {(row.bankPayment?.notPresented?.count || 0).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between pt-2 border-t">
                                <span className="text-gray-600">Presentation Rate:</span>
                                <span className="font-medium">
                                  {row.bankPayment?.presentationRate || '0%'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Stage Breakdown */}
                          <div className="md:col-span-3 bg-white p-4 rounded-lg border border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-3">
                              Stage Breakdown
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              {Object.entries(row.stages || {}).map(([stage, data]: [string, any]) => (
                                <div
                                  key={stage}
                                  className="text-center p-3 bg-gray-50 rounded"
                                >
                                  <div className="text-xs text-gray-600 mb-1">
                                    {stage}
                                  </div>
                                  <div className="text-lg font-bold text-gray-900">
                                    {(data?.count || 0).toLocaleString()}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {data?.amountFormatted || '₹0.00'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No data available for selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

const MdApprovalDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [dailyData, setDailyData] = useState<DateWiseData[]>([]);
  const [filters, setFilters] = useState<DateWiseFilters>(() => {
    const { start, end } = getLast30Days();
    return { startDate: start, endDate: end };
  });

  // Modal states for beneficiary details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'FAILED' | 'NOT_PRESENTED'>('FAILED');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mdApprovalApi.getDateWiseAggregated(filters);

      setSummary(response.summary);
      setDailyData(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyFilters = () => {
    fetchData();
  };

  const handleViewDetails = (date: string) => {
    console.log('View details for date:', date);
    alert(`View details for ${formatIndianDate(date)}`);
  };

  // Handle Failed click
  const handleFailedClick = (date: string, count: number) => {
    if (count > 0) {
      setSelectedDate(date);
      setSelectedCount(count);
      setModalType('FAILED');
      setIsModalOpen(true);
    }
  };

  // Handle Not Presented click
  const handleNotPresentedClick = (date: string, count: number) => {
    if (count > 0) {
      setSelectedDate(date);
      setSelectedCount(count);
      setModalType('NOT_PRESENTED');
      setIsModalOpen(true);
    }
  };

  const handleExport = () => {
    console.log('Export data:', dailyData);
    alert('Export functionality to be implemented');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            MD Approval & Payment Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Date-wise analytics with payment verification from pay_records_integrated
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <DateFilter
            filters={filters}
            onFiltersChange={setFilters}
            onApply={handleApplyFilters}
          />
        </div>

        {/* Summary Statistics */}
        {summary && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Summary ({formatIndianDate(summary.dateRange?.start || '')} to{' '}
              {formatIndianDate(summary.dateRange?.end || '')})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatCard
                title="Total Approved"
                value={(summary.totalApproved || 0).toLocaleString()}
                icon={<CheckCircle className="w-6 h-6" />}
                color="blue"
              />
              <StatCard
                title="Bank Paid (Success)"
                value={(summary.totalSuccessCount || 0).toLocaleString()}
                subtitle={`${summary.totalSuccessAmountFormatted || '₹0.00'} • ${summary.overallSuccessRate || '0%'}`}
                icon={<CreditCard className="w-6 h-6" />}
                color="green"
              />
              <StatCard
                title="Bank Failed"
                value={(summary.totalFailedCount || 0).toLocaleString()}
                subtitle={summary.totalFailedAmountFormatted || '₹0.00'}
                icon={<XCircle className="w-6 h-6" />}
                color="red"
              />
              <StatCard
                title="Not Presented"
                value={(summary.totalNotPresentedCount || 0).toLocaleString()}
                icon={<AlertTriangle className="w-6 h-6" />}
                color="orange"
              />
              <StatCard
                title="Presentation Rate"
                value={summary.overallPresentationRate || '0%'}
                subtitle={`${(summary.totalPresentedCount || 0).toLocaleString()} presented`}
                icon={<TrendingUp className="w-6 h-6" />}
                color="purple"
              />
            </div>
          </div>
        )}

        {/* Export Button */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </button>
        </div>

        {/* Daily Data Table */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Daily Breakdown ({dailyData.length} days)
          </h2>
          <DailyDataTable 
            data={dailyData} 
            onViewDetails={handleViewDetails}
            onFailedClick={handleFailedClick}
            onNotPresentedClick={handleNotPresentedClick}
          />
        </div>
      </div>

      {/* Beneficiary Details Modal */}
      <BeneficiaryDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        type={modalType}
        count={selectedCount}
      />
    </div>
  );
};

export default MdApprovalDashboard;