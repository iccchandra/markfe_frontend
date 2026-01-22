// src/pages/CGGbatch/SuccessAnalysisDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Building2,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useSuccessAnalysis } from '../../hooks/useSuccessAnalysis';
import { AmountRange, PaymentStage } from '../../services/successAnalysisApi';

const STAGE_COLORS: Record<string, string> = {
  BL: '#3B82F6',
  RL: '#F59E0B',
  RC: '#8B5CF6',
  COMPLETED: '#10B981'
};

const AMOUNT_RANGE_LABELS = {
  [AmountRange.BELOW_1_LAKH]: 'Below ₹1 Lakh',
  [AmountRange.BETWEEN_1_2_LAKH]: '₹1-2 Lakh',
  [AmountRange.BETWEEN_2_3_LAKH]: '₹2-3 Lakh',
  [AmountRange.BETWEEN_3_4_LAKH]: '₹3-4 Lakh',
  [AmountRange.BETWEEN_4_5_LAKH]: '₹4-5 Lakh',
  [AmountRange.ABOVE_5_LAKH]: 'Above ₹5 Lakh',
  [AmountRange.ALL]: 'All Amounts'
};

const CONSTRUCTION_LEVEL_LABELS: Record<string, string> = {
  BL: 'Plinth Level',
  RL: 'Lintel Level',
  RC: 'Roof Casting Level',
  COMPLETED: 'House Completion'
};

type TabType = 'banks' | 'beneficiaries';

export const SuccessAnalysisDashboard: React.FC = () => {
  const [filters, setFilters] = useState({
    amountRange: AmountRange.ALL,
    stage: PaymentStage.ALL
  });

  const [activeTab, setActiveTab] = useState<TabType>('banks');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const { data, loading, error, fetchData } = useSuccessAnalysis();

  useEffect(() => {
    fetchData({
      amountRange: filters.amountRange,
      stage: filters.stage
    });
  }, []);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchData({
      amountRange: filters.amountRange,
      stage: filters.stage
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount / 100);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const totalPages = data ? Math.ceil(data.data.length / itemsPerPage) : 0;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBeneficiaries = data ? data.data.slice(startIndex, endIndex) : [];

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-xl">Loading success analysis...</p>
          <p className="text-gray-500 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Error</h3>
          </div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => fetchData({ amountRange: filters.amountRange, stage: filters.stage })}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                Success Payment Analysis
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                All successful APBS payments with response code 00
              </p>
              <p className="text-sm text-green-600 font-medium mt-1">
                Showing: {data.filters.amountRange} | Stage: {data.filters.stage}
              </p>
            </div>
            <button
              onClick={() => fetchData({ amountRange: filters.amountRange, stage: filters.stage })}
              className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Range
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.amountRange}
                onChange={(e) => handleFilterChange('amountRange', e.target.value)}
              >
                {Object.entries(AMOUNT_RANGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Construction Level
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={filters.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
              >
                <option value={PaymentStage.ALL}>All Levels</option>
                <option value={PaymentStage.BL}>BL - Plinth Level</option>
                <option value={PaymentStage.RL}>RL - Lintel Level</option>
                <option value={PaymentStage.RC}>RC - Roof Casting</option>
                <option value={PaymentStage.COMPLETED}>COMPLETED - House Completion</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleApplyFilters}
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Beneficiaries</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(data.summary.totalBeneficiaries)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Amount Paid</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(data.summary.totalAmount)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Average Payment</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(data.summary.averageAmount)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Highest Payment</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(data.summary.highestPayment)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Lowest Payment</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(data.summary.lowestPayment)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Median Payment</p>
                <p className="text-xl font-bold text-indigo-600">
                  {formatCurrency(data.summary.medianAmount)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-6">
          {/* Construction Level Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Construction Level Payment Distribution
            </h3>
            
            {/* Stage Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {data.summary.stageWiseBreakdown.map((stageData) => (
                <div 
                  key={stageData.stage} 
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  style={{ borderLeftWidth: '4px', borderLeftColor: STAGE_COLORS[stageData.stage] || '#6B7280' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">{stageData.stage}</h4>
                      <p className="text-xs text-gray-500">
                        {CONSTRUCTION_LEVEL_LABELS[stageData.stage]}
                      </p>
                    </div>
                    <span 
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{ 
                        backgroundColor: `${STAGE_COLORS[stageData.stage]}20`, 
                        color: STAGE_COLORS[stageData.stage] 
                      }}
                    >
                      {stageData.percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Paid:</span>
                      <span className="text-sm font-bold text-green-600">{formatNumber(stageData.count)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Amount:</span>
                      <span className="text-xs font-semibold text-gray-900">{formatCurrency(stageData.totalAmount)}</span>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-1 mt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-blue-600">
                          {stageData.stage === 'COMPLETED' ? 'Completed' : 'Ready for Next:'}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatNumber(stageData.readyForNext)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Construction Progress Flow */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-3 text-center">Construction Progress Flow</h4>
              <div className="flex items-center justify-between">
                {['BL', 'RL', 'RC', 'COMPLETED'].map((stage, index) => (
                  <React.Fragment key={stage}>
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md"
                        style={{ backgroundColor: STAGE_COLORS[stage] }}
                      >
                        <Home className="h-5 w-5" />
                      </div>
                      <span className="mt-1 text-xs font-bold text-gray-700">
                        {stage}
                      </span>
                      <span className="text-xs text-gray-500">
                        {stage === 'BL' && 'Plinth'}
                        {stage === 'RL' && 'Lintel'}
                        {stage === 'RC' && 'Roof'}
                        {stage === 'COMPLETED' && 'Done'}
                      </span>
                    </div>
                    {index < 3 && (
                      <div className="flex-1 h-1 bg-gray-300 mx-1" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Amount Range Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Amount Range Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.summary.amountRangeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rangeLabel" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('banks')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'banks'
                    ? 'border-b-2 border-green-600 text-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span>Top Banks</span>
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                    {data.summary.bankWiseBreakdown.length}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('beneficiaries')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'beneficiaries'
                    ? 'border-b-2 border-green-600 text-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Beneficiaries</span>
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                    {formatNumber(data.data.length)}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'banks' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Banks by Beneficiary Count
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Bank Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Bank IIN
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Beneficiaries
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Average Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {data.summary.bankWiseBreakdown.map((bank, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            #{index + 1}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{bank.bankName}</td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-600">{bank.bankIIN}</td>
                          <td className="px-6 py-4 text-sm text-center">
                            <span className="px-3 py-1 rounded-full font-semibold bg-green-100 text-green-700">
                              {formatNumber(bank.beneficiaryCount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                            {formatCurrency(bank.totalAmount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-right text-gray-700">
                            {formatCurrency(bank.averageAmount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'beneficiaries' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Successful Beneficiaries
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Rows per page:</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                      </select>
                    </div>
                    <span className="text-sm text-gray-600">
                      Showing {startIndex + 1}-{Math.min(endIndex, data.data.length)} of{' '}
                      {formatNumber(data.data.length)}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sr No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Beneficiary ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Aadhaar
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                          Level
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                          Amount Paid
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Bank
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Payment Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentBeneficiaries.map((beneficiary, index) => (
                        <tr key={beneficiary.beneficiaryId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {startIndex + index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {beneficiary.beneficiaryId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{beneficiary.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                            {beneficiary.aadhaarNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                            <div className="flex flex-col items-center">
                              <span 
                                className="px-2 py-1 text-xs rounded-full font-semibold"
                                style={{
                                  backgroundColor: `${STAGE_COLORS[beneficiary.stage]}20`,
                                  color: STAGE_COLORS[beneficiary.stage]
                                }}
                              >
                                {beneficiary.stage}
                              </span>
                              <span className="text-xs text-gray-500 mt-1">
                                {CONSTRUCTION_LEVEL_LABELS[beneficiary.stage]?.split(' ')[0]}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                            {formatCurrency(beneficiary.paidAmount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{beneficiary.bankName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(beneficiary.paymentDate).toLocaleDateString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {currentPage > 3 && (
                        <>
                          <button
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            1
                          </button>
                          {currentPage > 4 && <span className="text-gray-500">...</span>}
                        </>
                      )}

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        if (pageNum < 1 || pageNum > totalPages) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded text-sm font-medium ${
                              currentPage === pageNum
                                ? 'bg-green-600 text-white'
                                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && <span className="text-gray-500">...</span>}
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnalysisDashboard;