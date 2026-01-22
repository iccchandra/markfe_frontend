// OptimizedAadhaarFailuresReport.tsx
// PROGRESSIVE LOADING STRATEGY:
// 1. Load cached summary instantly (<200ms)
// 2. Load detailed sections on-demand when user clicks tabs
// 3. Use pagination for large datasets
// 4. Show loading skeletons while fetching

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  AlertTriangle,
  TrendingDown,
  XCircle,
  DollarSign,
  Users,
  Building2,
  Download,
  RefreshCw,
  FileText,
  CheckCircle2,
  Info,
  ChevronRight,
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:3002';

// ============================================================================
// INTERFACES
// ============================================================================

interface FailuresSummary {
  summary: {
    totalPaymentAttempts: number;
    totalFailures: number;
    overallFailureRate: number;
    totalFailedAmount: number;
    affectedBeneficiaries: number;
    totalPennyDropFailures: number;
    pennyDropFailureRate: number;
  };
  topFailureReasons: Array<{
    code: string;
    reason: string;
    count: number;
    percentage: number;
  }>;
  cached: boolean;
  cacheAge: number;
  generatedAt: string;
}

// ============================================================================
// LOADING SKELETON COMPONENT
// ============================================================================

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-32 bg-gray-200 rounded-lg"></div>
    <div className="h-48 bg-gray-200 rounded-lg"></div>
    <div className="h-64 bg-gray-200 rounded-lg"></div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AadhaarFailuresReport: React.FC = () => {
  // State for fast summary (loads immediately)
  const [summary, setSummary] = useState<FailuresSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // State for detailed tabs (loads on demand)
  const [activeTab, setActiveTab] = useState<'overview' | 'reasons' | 'banks' | 'detailed'>('overview');
  const [reasonsData, setReasonsData] = useState<any>(null);
  const [reasonsLoading, setReasonsLoading] = useState(false);
  const [reasonsPage, setReasonsPage] = useState(1);
  
  const [banksData, setBanksData] = useState<any[]>([]);
  const [banksLoading, setBanksLoading] = useState(false);

  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
  const [detailedLoading, setDetailedLoading] = useState(false);

  const [expandedReason, setExpandedReason] = useState<string | null>(null);
  const [reasonExamples, setReasonExamples] = useState<Record<string, any[]>>({});

  // ========================================================================
  // LOAD FAST SUMMARY ON MOUNT
  // ========================================================================
  useEffect(() => {
    fetchFastSummary();
  }, []);

  const fetchFastSummary = async () => {
    try {
      setSummaryLoading(true);
      const response = await axios.get(`${API_BASE_URL}/failures/summary`);
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  // ========================================================================
  // LOAD DATA WHEN TAB CHANGES
  // ========================================================================
  useEffect(() => {
    if (activeTab === 'reasons' && !reasonsData) {
      fetchReasonsData();
    } else if (activeTab === 'banks' && banksData.length === 0) {
      fetchBanksData();
    } else if (activeTab === 'detailed' && !detailedAnalysis) {
      fetchDetailedAnalysis();
    }
  }, [activeTab]);

  // ========================================================================
  // FETCH FUNCTIONS
  // ========================================================================
  
  const fetchReasonsData = async (page: number = 1) => {
    try {
      setReasonsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/failures/reasons`, {
        params: { page, limit: 20 },
      });
      setReasonsData(response.data);
      setReasonsPage(page);
    } catch (error) {
      console.error('Failed to fetch reasons:', error);
    } finally {
      setReasonsLoading(false);
    }
  };

  const fetchReasonExamples = async (code: string) => {
    if (reasonExamples[code]) {
      return; // Already loaded
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/failures/reasons/${code}/examples`, {
        params: { limit: 5 },
      });
      setReasonExamples(prev => ({
        ...prev,
        [code]: response.data,
      }));
    } catch (error) {
      console.error('Failed to fetch examples:', error);
    }
  };

  const fetchBanksData = async () => {
    try {
      setBanksLoading(true);
      const response = await axios.get(`${API_BASE_URL}/failures/banks`);
      setBanksData(response.data);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    } finally {
      setBanksLoading(false);
    }
  };

  const fetchDetailedAnalysis = async () => {
    try {
      setDetailedLoading(true);
      const response = await axios.get(`${API_BASE_URL}/failures/analysis`);
      setDetailedAnalysis(response.data);
    } catch (error) {
      console.error('Failed to fetch detailed analysis:', error);
    } finally {
      setDetailedLoading(false);
    }
  };

  const handleRefresh = async () => {
    // Clear cache first
    try {
      await axios.get(`${API_BASE_URL}/failures/cache/clear`);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
    
    // Reload current data
    fetchFastSummary();
    
    if (activeTab === 'reasons' && reasonsData) {
      fetchReasonsData(reasonsPage);
    } else if (activeTab === 'banks' && banksData.length > 0) {
      fetchBanksData();
    } else if (activeTab === 'detailed' && detailedAnalysis) {
      fetchDetailedAnalysis();
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/failures/analysis`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `failures-report-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  if (summaryLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading failures analysis...</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Failed to load summary</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <XCircle className="w-7 h-7 text-red-600" />
                Aadhaar Payment Failures Analysis
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Optimized view • {summary.cached ? `Cached (${summary.cacheAge}s old)` : 'Live data'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={summaryLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${summaryLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-xs font-semibold text-red-700 uppercase">Total Failures</span>
              </div>
              <div className="text-2xl font-bold text-red-900">
                {summary.summary.totalFailures.toLocaleString()}
              </div>
              <div className="text-xs text-red-600 mt-1">
                {summary.summary.overallFailureRate.toFixed(2)}% of {summary.summary.totalPaymentAttempts.toLocaleString()} attempts
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-semibold text-orange-700 uppercase">Failed Amount</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                ₹{summary.summary.totalFailedAmount.toFixed(2)}L
              </div>
              <div className="text-xs text-orange-600 mt-1">Total amount in failed payments</div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-semibold text-purple-700 uppercase">Affected</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {summary.summary.affectedBeneficiaries.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600 mt-1">Unique beneficiaries</div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-700 uppercase">Penny Drop</span>
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {summary.summary.totalPennyDropFailures.toLocaleString()}
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                {summary.summary.pennyDropFailureRate.toFixed(2)}% failure rate
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase">Top Reasons</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">{summary.topFailureReasons.length}</div>
              <div className="text-xs text-blue-600 mt-1">Most common issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'reasons', label: 'Reason Codes', icon: FileText },
              { id: 'banks', label: 'By Bank', icon: Building2 },
              { id: 'detailed', label: 'Full Analysis', icon: TrendingDown },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600 bg-red-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top 5 Failure Reasons</h2>
              <div className="space-y-3">
                {summary.topFailureReasons.map((reason, index) => (
                  <div key={reason.code} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-gray-900">Code {reason.code}</span>
                          <span className="text-sm font-medium text-gray-700">{reason.reason}</span>
                        </div>
                        <span className="text-sm font-bold text-red-600">{reason.count.toLocaleString()} failures</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full transition-all"
                          style={{ width: `${reason.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {reason.percentage.toFixed(2)}% of total failures
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('reasons');
                        setExpandedReason(reason.code);
                      }}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      View Details
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setActiveTab('reasons')}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">View All Reason Codes</div>
                    <div className="text-sm text-gray-600">Detailed analysis with examples</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </button>
                
                <button
                  onClick={() => setActiveTab('banks')}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Bank Performance</div>
                    <div className="text-sm text-gray-600">Top 20 banks by failure rate</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reasons Tab */}
        {activeTab === 'reasons' && (
          <div>
            {reasonsLoading ? (
              <LoadingSkeleton />
            ) : reasonsData ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Reason Code Analysis</h2>
                <div className="space-y-3">
                  {reasonsData.data.map((reason: any) => (
                    <div key={reason.code} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          const newExpanded = expandedReason === reason.code ? null : reason.code;
                          setExpandedReason(newExpanded);
                          if (newExpanded) {
                            fetchReasonExamples(newExpanded);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="font-mono text-lg font-bold text-gray-900 bg-white px-3 py-1 rounded border border-gray-300">
                              {reason.code}
                            </span>
                            <div>
                              <div className="font-semibold text-gray-900">{reason.reason}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-semibold">
                                  {reason.category}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-600">{reason.count.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{reason.percentage.toFixed(2)}% of failures</div>
                          </div>
                        </div>
                      </div>

                      {expandedReason === reason.code && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Affected Amount</div>
                              <div className="text-lg font-bold text-gray-900">₹{reason.totalAmount.toFixed(2)}L</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Beneficiaries</div>
                              <div className="text-lg font-bold text-gray-900">{reason.affectedBeneficiaries.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 uppercase font-semibold mb-1">Recommended Action</div>
                              <div className="text-sm text-gray-700">{reason.action}</div>
                            </div>
                          </div>

                          {reasonExamples[reason.code] && (
                            <div>
                              <div className="text-sm font-semibold text-gray-700 mb-2">Recent Examples:</div>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Beneficiary ID</th>
                                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Name</th>
                                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Stage</th>
                                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Amount</th>
                                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Bank</th>
                                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {reasonExamples[reason.code].map((example: any, idx: number) => (
                                      <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 font-mono text-xs">{example.beneficiaryId}</td>
                                        <td className="px-3 py-2">{example.name}</td>
                                        <td className="px-3 py-2">
                                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                            {example.stage}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 font-semibold">₹{example.amount.toFixed(2)}L</td>
                                        <td className="px-3 py-2 text-xs">{example.bankName}</td>
                                        <td className="px-3 py-2 text-xs">
                                          {new Date(example.bankProcessedDate).toLocaleDateString()}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {reasonsData.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Page {reasonsData.pagination.page} of {reasonsData.pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => fetchReasonsData(reasonsPage - 1)}
                        disabled={reasonsPage === 1}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => fetchReasonsData(reasonsPage + 1)}
                        disabled={reasonsPage === reasonsData.pagination.totalPages}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Banks Tab */}
        {activeTab === 'banks' && (
          <div>
            {banksLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Bank-wise Failure Analysis</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Bank Name</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Total Attempts</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Failures</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Failure Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Beneficiaries</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {banksData.map((bank) => (
                        <tr key={bank.bankIIN} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{bank.bankName}</div>
                            <div className="text-xs text-gray-500 font-mono">{bank.bankIIN}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{bank.totalAttempts.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-red-600">{bank.totalFailures.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-bold text-gray-900">{bank.failureRate.toFixed(2)}%</div>
                              {bank.failureRate > 20 && (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{bank.totalAmount.toFixed(2)}L</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{bank.uniqueBeneficiaries.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed Analysis Tab */}
        {activeTab === 'detailed' && (
          <div>
            {detailedLoading ? (
              <LoadingSkeleton />
            ) : detailedAnalysis ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Full Comprehensive Analysis</h2>
                <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(detailedAnalysis, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <button
                  onClick={fetchDetailedAnalysis}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-all"
                >
                  Load Full Analysis (May take 10-30 seconds)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AadhaarFailuresReport;