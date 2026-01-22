// ============================================
// pages/reports/DistrictReport.tsx
// District-wise Performance Report - Complete Implementation
// ============================================

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  MapPin, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Users,
  Clock,
  BarChart3,
  Filter,
  Calendar,
  FileText,
  Award,
  Activity
} from 'lucide-react';

// ============================================
// Types and Interfaces
// ============================================

interface DistrictPerformance {
  district: string;
  totalBeneficiaries: number;
  verified: number;
  failed: number;
  completed: number;
  completionRate: number;
  avgProcessingTime: number;
  dataQuality: number;
  rejectionRate: number;
  totalAmount: number;
  paidAmount: number;
}

interface StageDistribution {
  district: string;
  BL: number;
  RL: number;
  RC: number;
  COMPLETED: number;
}

interface DistrictFinancial {
  district: string;
  expectedAmount: number;
  paidAmount: number;
  variance: number;
  variancePercent: number;
}

interface DistrictInsight {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description: string;
  icon: React.ReactNode;
}

// ============================================
// Main Component
// ============================================

export const DistrictReport: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('this-month');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'financial' | 'stages'>('overview');

  // Mock data - Replace with API calls
  const districtPerformance: DistrictPerformance[] = [
    {
      district: 'Hyderabad',
      totalBeneficiaries: 45000,
      verified: 44100,
      failed: 900,
      completed: 38250,
      completionRate: 85.0,
      avgProcessingTime: 12,
      dataQuality: 98.0,
      rejectionRate: 2.0,
      totalAmount: 2250000000,
      paidAmount: 2205000000
    },
    {
      district: 'Warangal',
      totalBeneficiaries: 38000,
      verified: 37240,
      failed: 760,
      completed: 32680,
      completionRate: 86.0,
      avgProcessingTime: 11,
      dataQuality: 98.0,
      rejectionRate: 2.0,
      totalAmount: 1900000000,
      paidAmount: 1862000000
    },
    {
      district: 'Karimnagar',
      totalBeneficiaries: 42000,
      verified: 41160,
      failed: 840,
      completed: 36120,
      completionRate: 86.0,
      avgProcessingTime: 13,
      dataQuality: 98.0,
      rejectionRate: 2.0,
      totalAmount: 2100000000,
      paidAmount: 2058000000
    },
    {
      district: 'Nizamabad',
      totalBeneficiaries: 35000,
      verified: 34300,
      failed: 700,
      completed: 30100,
      completionRate: 86.0,
      avgProcessingTime: 14,
      dataQuality: 98.0,
      rejectionRate: 2.0,
      totalAmount: 1750000000,
      paidAmount: 1715000000
    },
    {
      district: 'Khammam',
      totalBeneficiaries: 32000,
      verified: 31040,
      failed: 960,
      completed: 26880,
      completionRate: 84.0,
      avgProcessingTime: 15,
      dataQuality: 97.0,
      rejectionRate: 3.0,
      totalAmount: 1600000000,
      paidAmount: 1552000000
    },
    {
      district: 'Nalgonda',
      totalBeneficiaries: 38500,
      verified: 37730,
      failed: 770,
      completed: 33110,
      completionRate: 86.0,
      avgProcessingTime: 12,
      dataQuality: 98.0,
      rejectionRate: 2.0,
      totalAmount: 1925000000,
      paidAmount: 1886500000
    },
    {
      district: 'Medak',
      totalBeneficiaries: 29000,
      verified: 28420,
      failed: 580,
      completed: 24940,
      completionRate: 86.0,
      avgProcessingTime: 13,
      dataQuality: 98.0,
      rejectionRate: 2.0,
      totalAmount: 1450000000,
      paidAmount: 1421000000
    },
    {
      district: 'Adilabad',
      totalBeneficiaries: 27500,
      verified: 26675,
      failed: 825,
      completed: 23100,
      completionRate: 84.0,
      avgProcessingTime: 16,
      dataQuality: 97.0,
      rejectionRate: 3.0,
      totalAmount: 1375000000,
      paidAmount: 1320000000
    }
  ];

  const stageDistribution: StageDistribution[] = [
    { district: 'Hyderabad', BL: 13500, RL: 10800, RC: 12150, COMPLETED: 8550 },
    { district: 'Warangal', BL: 11400, RL: 9120, RC: 10260, COMPLETED: 7220 },
    { district: 'Karimnagar', BL: 12600, RL: 10080, RC: 11340, COMPLETED: 7980 },
    { district: 'Nizamabad', BL: 10500, RL: 8400, RC: 9450, COMPLETED: 6650 },
    { district: 'Khammam', BL: 9600, RL: 7680, RC: 8640, COMPLETED: 6080 },
    { district: 'Nalgonda', BL: 11550, RL: 9240, RC: 10395, COMPLETED: 7315 },
    { district: 'Medak', BL: 8700, RL: 6960, RC: 7830, COMPLETED: 5510 },
    { district: 'Adilabad', BL: 8250, RL: 6600, RC: 7425, COMPLETED: 5225 }
  ];

  // Calculate summary statistics
  const totalStats = {
    totalBeneficiaries: districtPerformance.reduce((sum, d) => sum + d.totalBeneficiaries, 0),
    totalVerified: districtPerformance.reduce((sum, d) => sum + d.verified, 0),
    totalCompleted: districtPerformance.reduce((sum, d) => sum + d.completed, 0),
    avgCompletionRate: (districtPerformance.reduce((sum, d) => sum + d.completionRate, 0) / districtPerformance.length).toFixed(1),
    avgDataQuality: (districtPerformance.reduce((sum, d) => sum + d.dataQuality, 0) / districtPerformance.length).toFixed(1),
    totalAmount: districtPerformance.reduce((sum, d) => sum + d.totalAmount, 0),
    totalPaid: districtPerformance.reduce((sum, d) => sum + d.paidAmount, 0)
  };

  // Helper Functions
  const formatCurrency = (amount: number): string => {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  const getCompletionRateColor = (rate: number): string => {
    if (rate >= 86) return 'bg-green-100 text-green-800';
    if (rate >= 84) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getDataQualityColor = (quality: number): string => {
    if (quality >= 98) return 'bg-green-100 text-green-800';
    if (quality >= 97) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getStageColor = (stage: string): string => {
    switch (stage) {
      case 'BL': return 'bg-blue-600';
      case 'RL': return 'bg-yellow-600';
      case 'RC': return 'bg-purple-600';
      case 'COMPLETED': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting district report as ${format}`);
    // Implement export logic
  };

  // Get top and bottom performers
  const topPerformers = [...districtPerformance]
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 3);

  const fastestProcessing = [...districtPerformance]
    .sort((a, b) => a.avgProcessingTime - b.avgProcessingTime)
    .slice(0, 3);

  const bestDataQuality = [...districtPerformance]
    .sort((a, b) => b.dataQuality - a.dataQuality)
    .slice(0, 3);

  // Generate insights
  const insights: DistrictInsight[] = [
    {
      type: 'success',
      title: 'Top Performing Districts',
      description: `${topPerformers.map(d => d.district).join(', ')} maintain ${topPerformers[0].completionRate}% completion rates with excellent data quality`,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />
    },
    {
      type: 'info',
      title: 'Processing Efficiency',
      description: `${fastestProcessing[0].district} leads with ${fastestProcessing[0].avgProcessingTime}-day average processing time, ${Math.round(((districtPerformance[districtPerformance.length - 1].avgProcessingTime - fastestProcessing[0].avgProcessingTime) / fastestProcessing[0].avgProcessingTime) * 100)}% faster than the slowest district`,
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />
    },
    {
      type: 'warning',
      title: 'Improvement Opportunity',
      description: `Khammam and Adilabad show 84% completion rate. Focus on streamlining validation processes and reducing processing time`,
      icon: <AlertCircle className="w-5 h-5 text-orange-600" />
    },
    {
      type: 'info',
      title: 'Volume Distribution',
      description: `Hyderabad handles largest volume (45,000 beneficiaries) while maintaining 85% completion rate and 98% data quality`,
      icon: <MapPin className="w-5 h-5 text-purple-600" />
    }
  ];

  const getInsightBgColor = (type: string): string => {
    switch (type) {
      case 'success': return 'bg-green-50';
      case 'info': return 'bg-blue-50';
      case 'warning': return 'bg-orange-50';
      case 'error': return 'bg-red-50';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">District-wise Performance Report</h1>
            <p className="text-gray-600">Regional analysis and comparative performance metrics</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="this-year">This Year</option>
            </select>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Districts</option>
              {districtPerformance.map((d) => (
                <option key={d.district} value={d.district.toLowerCase()}>
                  {d.district}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Beneficiaries</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalBeneficiaries.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Across {districtPerformance.length} districts</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.avgCompletionRate}%</p>
                <p className="text-xs text-green-600 mt-1">Excellent performance</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount Paid</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalStats.totalPaid)}</p>
                <p className="text-xs text-gray-500 mt-1">Out of {formatCurrency(totalStats.totalAmount)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Data Quality</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.avgDataQuality}%</p>
                <p className="text-xs text-purple-600 mt-1">High quality data</p>
              </div>
              <Activity className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance Overview
            </button>
            <button
              onClick={() => setActiveTab('stages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'stages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Stage Distribution
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'financial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Financial Analysis
            </button>
          </nav>
        </div>
      </div>

      {/* Performance Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">District Performance Overview</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Beneficiaries
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Failed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completion Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Processing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Quality
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {districtPerformance.map((district) => (
                    <tr key={district.district} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{district.district}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {district.totalBeneficiaries.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {district.verified.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {district.failed.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                        {district.completed.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCompletionRateColor(district.completionRate)}`}>
                          {district.completionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-1" />
                          {district.avgProcessingTime} days
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDataQualityColor(district.dataQuality)}`}>
                          {district.dataQuality}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparative Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 text-green-600 mr-2" />
                Highest Completion Rate
              </h3>
              <div className="space-y-3">
                {topPerformers.map((district, index) => (
                  <div key={district.district} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                      <span className="text-sm text-gray-900">{district.district}</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{district.completionRate}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                Fastest Processing
              </h3>
              <div className="space-y-3">
                {fastestProcessing.map((district, index) => (
                  <div key={district.district} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                      <span className="text-sm text-gray-900">{district.district}</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{district.avgProcessingTime} days</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 text-purple-600 mr-2" />
                Best Data Quality
              </h3>
              <div className="space-y-3">
                {bestDataQuality.map((district, index) => (
                  <div key={district.district} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                      <span className="text-sm text-gray-900">{district.district}</span>
                    </div>
                    <span className="text-lg font-bold text-purple-600">{district.dataQuality}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Stage Distribution Tab */}
      {activeTab === 'stages' && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stage Distribution by District</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BL (₹1L)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RL (₹1L)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RC (₹2L)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    COMPLETED (₹1L)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visual Distribution
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stageDistribution.map((district) => {
                  const total = district.BL + district.RL + district.RC + district.COMPLETED;
                  return (
                    <tr key={district.district} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {district.district}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {district.BL.toLocaleString()}
                        <span className="text-xs text-gray-500 ml-1">
                          ({((district.BL / total) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                        {district.RL.toLocaleString()}
                        <span className="text-xs text-gray-500 ml-1">
                          ({((district.RL / total) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-600">
                        {district.RC.toLocaleString()}
                        <span className="text-xs text-gray-500 ml-1">
                          ({((district.RC / total) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {district.COMPLETED.toLocaleString()}
                        <span className="text-xs text-gray-500 ml-1">
                          ({((district.COMPLETED / total) * 100).toFixed(1)}%)
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-0.5 w-full h-6 rounded overflow-hidden">
                          <div
                            className="bg-blue-600 transition-all"
                            style={{ width: `${(district.BL / total) * 100}%` }}
                            title={`BL: ${district.BL.toLocaleString()}`}
                          />
                          <div
                            className="bg-yellow-600 transition-all"
                            style={{ width: `${(district.RL / total) * 100}%` }}
                            title={`RL: ${district.RL.toLocaleString()}`}
                          />
                          <div
                            className="bg-purple-600 transition-all"
                            style={{ width: `${(district.RC / total) * 100}%` }}
                            title={`RC: ${district.RC.toLocaleString()}`}
                          />
                          <div
                            className="bg-green-600 transition-all"
                            style={{ width: `${(district.COMPLETED / total) * 100}%` }}
                            title={`COMPLETED: ${district.COMPLETED.toLocaleString()}`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stage Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">BL Stage</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {stageDistribution.reduce((sum, d) => sum + d.BL, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {formatCurrency(stageDistribution.reduce((sum, d) => sum + d.BL, 0) * 100000)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-lg"></div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">RL Stage</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {stageDistribution.reduce((sum, d) => sum + d.RL, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {formatCurrency(stageDistribution.reduce((sum, d) => sum + d.RL, 0) * 100000)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-600 rounded-lg"></div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">RC Stage</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {stageDistribution.reduce((sum, d) => sum + d.RC, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {formatCurrency(stageDistribution.reduce((sum, d) => sum + d.RC, 0) * 200000)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-600 rounded-lg"></div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">COMPLETED</p>
                  <p className="text-2xl font-bold text-green-900">
                    {stageDistribution.reduce((sum, d) => sum + d.COMPLETED, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {formatCurrency(stageDistribution.reduce((sum, d) => sum + d.COMPLETED, 0) * 100000)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-600 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Analysis Tab */}
      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Financial Performance by District</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      District
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beneficiaries
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paid Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {districtPerformance.map((district) => {
                    const variance = district.paidAmount - district.totalAmount;
                    const variancePercent = ((variance / district.totalAmount) * 100).toFixed(2);
                    const successRate = ((district.paidAmount / district.totalAmount) * 100).toFixed(1);
                    
                    return (
                      <tr key={district.district} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {district.district}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {district.totalBeneficiaries.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(district.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(district.paidAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(Math.abs(variance))}
                            <span className="text-xs ml-1">({variancePercent}%)</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            parseFloat(successRate) >= 98 ? 'bg-green-100 text-green-800' :
                            parseFloat(successRate) >= 95 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {successRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{ width: `${successRate}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      TOTAL
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {totalStats.totalBeneficiaries.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {formatCurrency(totalStats.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {formatCurrency(totalStats.totalPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                      {formatCurrency(totalStats.totalAmount - totalStats.totalPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {((totalStats.totalPaid / totalStats.totalAmount) * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Highest Disbursement</h3>
              <div className="space-y-3">
                {[...districtPerformance]
                  .sort((a, b) => b.paidAmount - a.paidAmount)
                  .slice(0, 3)
                  .map((district, index) => (
                    <div key={district.district} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                        <span className="text-sm text-gray-900">{district.district}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(district.paidAmount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lowest Rejection Rate</h3>
              <div className="space-y-3">
                {[...districtPerformance]
                  .sort((a, b) => a.rejectionRate - b.rejectionRate)
                  .slice(0, 3)
                  .map((district, index) => (
                    <div key={district.district} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                        <span className="text-sm text-gray-900">{district.district}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">
                        {district.rejectionRate}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Efficiency</h3>
              <div className="space-y-3">
                {[...districtPerformance]
                  .sort((a, b) => (b.paidAmount / b.totalAmount) - (a.paidAmount / a.totalAmount))
                  .slice(0, 3)
                  .map((district, index) => (
                    <div key={district.district} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-400 mr-3">#{index + 1}</span>
                        <span className="text-sm text-gray-900">{district.district}</span>
                      </div>
                      <span className="text-sm font-bold text-purple-600">
                        {((district.paidAmount / district.totalAmount) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regional Insights - Always visible at bottom */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          Regional Insights & Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg ${getInsightBgColor(insight.type)}`}>
              <div className="flex items-start space-x-3">
                {insight.icon}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">{insight.title}</p>
                  <p className="text-xs text-gray-600">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
          Recommended Actions
        </h2>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Focus on Slower Districts</p>
              <p className="text-xs text-gray-600 mt-1">
                Provide additional support to Khammam and Adilabad to improve their 15-16 day processing times. 
                Target: Reduce to 12-13 days within next quarter.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Replicate Best Practices</p>
              <p className="text-xs text-gray-600 mt-1">
                Study Warangal's 11-day processing model and share successful strategies with other districts. 
                Conduct knowledge transfer workshops.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                3
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Maintain High Performers</p>
              <p className="text-xs text-gray-600 mt-1">
                Continue supporting top performers (Warangal, Karimnagar, Nizamabad) with resources to maintain 
                their 86% completion rates and 98% data quality.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                4
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Scale High-Volume Success</p>
              <p className="text-xs text-gray-600 mt-1">
                Document Hyderabad's processes for handling 45,000 beneficiaries while maintaining quality. 
                Use as reference for scaling other high-volume districts.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options Footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <FileText className="w-4 h-4" />
            <span>Report generated on {new Date().toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
            >
              Export Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistrictReport;