// ReconciliationRecords.tsx - Table view of individual reconciliation records

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Eye,
  Filter
} from 'lucide-react';
import type { ReconciliationRecord, ReconciliationFilters } from '../../types';
import { ReconciliationFilters as FiltersComponent } from './ReconciliationFilters';

export const ReconciliationRecords: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  const [records, setRecords] = useState<ReconciliationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ReconciliationFilters>({
    matchStatus: 'all',
    paymentStatus: 'all',
    pennyDropStatus: 'all',
    stage: 'all',
    hasIssues: 'all',
    searchQuery: ''
  });

  const itemsPerPage = 20;

  useEffect(() => {
    fetchReconciliationRecords();
  }, [batchId]);

  const fetchReconciliationRecords = async () => {
    try {
      setLoading(true);
      // In production: const response = await fetch(`/api/reconciliation/${batchId}/records`);

      const mockRecords: ReconciliationRecord[] = [
        {
          id: 'r1',
          batchId: 'BATCH20250115001',
          beneficiaryId: 'BEN000001',
          name: 'Ramesh Kumar Singh',
          aadhaarNumber: '6297****0065',
          accountNumber: '052110118493',
          wasUploaded: true,
          uploadedAmount: 100000,
          pennyDropStatus: 'SUCCESS',
          pennyDropVerifiedName: 'RAMESH KUMAR SINGH',
          bankPaymentFound: true,
          bankPaymentStatus: 'SUCCESS',
          bankPaidAmount: 100000,
          npciResponseFlag: '1',
          responseCode: '00',
          rejectionReason: null,
          matchStatus: 'MATCHED',
          issues: [],
          requiresInvestigation: false,
          uploadDate: '2025-01-15T10:30:00Z',
          bankProcessedDate: '2025-01-26T14:30:00Z'
        },
        {
          id: 'r2',
          batchId: 'BATCH20250115001',
          beneficiaryId: 'BEN000002',
          name: 'Priya Sharma',
          aadhaarNumber: '5892****1234',
          accountNumber: '123456789012',
          wasUploaded: true,
          uploadedAmount: 100000,
          pennyDropStatus: 'SUCCESS',
          pennyDropVerifiedName: 'PRIYA SHARMA',
          bankPaymentFound: true,
          bankPaymentStatus: 'FAILED',
          bankPaidAmount: 0,
          npciResponseFlag: '0',
          responseCode: '58',
          rejectionReason: 'Credit Limit Exceeded',
          matchStatus: 'MISMATCHED',
          issues: ['Payment failure', 'Penny drop success but payment failed'],
          requiresInvestigation: true,
          uploadDate: '2025-01-15T10:30:00Z',
          bankProcessedDate: '2025-01-26T14:30:00Z'
        },
        {
          id: 'r3',
          batchId: 'BATCH20250115001',
          beneficiaryId: 'BEN000003',
          name: 'Amit Patel',
          aadhaarNumber: '7234****5678',
          accountNumber: '987654321098',
          wasUploaded: true,
          uploadedAmount: 100000,
          pennyDropStatus: 'FAILED',
          pennyDropVerifiedName: null,
          bankPaymentFound: false,
          bankPaymentStatus: 'PENDING',
          bankPaidAmount: 0,
          npciResponseFlag: '0',
          responseCode: 'XX',
          rejectionReason: 'Record not found in bank return',
          matchStatus: 'MISSING_IN_BANK',
          issues: ['Missing in bank return', 'Penny drop failed'],
          requiresInvestigation: true,
          uploadDate: '2025-01-15T10:30:00Z',
          bankProcessedDate: null
        },
        {
          id: 'r4',
          batchId: 'BATCH20250115001',
          beneficiaryId: 'BEN000004',
          name: 'Sneha Reddy',
          aadhaarNumber: '6543****2109',
          accountNumber: '555666777888',
          wasUploaded: true,
          uploadedAmount: 100000,
          pennyDropStatus: 'SUCCESS',
          pennyDropVerifiedName: 'SNEHA',
          bankPaymentFound: true,
          bankPaymentStatus: 'SUCCESS',
          bankPaidAmount: 100000,
          npciResponseFlag: '1',
          responseCode: '00',
          rejectionReason: null,
          matchStatus: 'PENNY_DROP_MISMATCH',
          issues: ['Name mismatch: SNEHA vs SNEHA REDDY'],
          requiresInvestigation: false,
          uploadDate: '2025-01-15T10:30:00Z',
          bankProcessedDate: '2025-01-26T14:30:00Z'
        }
      ];

      setRecords(mockRecords);
    } catch (error) {
      console.error('Failed to fetch reconciliation records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record => {
    if (filters.matchStatus !== 'all' && record.matchStatus !== filters.matchStatus) return false;
    if (filters.paymentStatus !== 'all' && record.bankPaymentStatus !== filters.paymentStatus) return false;
    if (filters.pennyDropStatus !== 'all' && record.pennyDropStatus !== filters.pennyDropStatus) return false;
    if (filters.hasIssues === 'true' && !record.requiresInvestigation) return false;
    if (filters.hasIssues === 'false' && record.requiresInvestigation) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        record.beneficiaryId.toLowerCase().includes(query) ||
        record.name.toLowerCase().includes(query) ||
        record.aadhaarNumber.includes(query) ||
        record.accountNumber.includes(query)
      );
    }
    return true;
  });

  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const getMatchStatusIcon = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'MISMATCHED':
      case 'PENNY_DROP_MISMATCH':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'MISSING_IN_BANK':
      case 'MISSING_IN_UPLOAD':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getMatchStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'MATCHED': 'Matched',
      'MISMATCHED': 'Mismatched',
      'PENNY_DROP_MISMATCH': 'Name Mismatch',
      'MISSING_IN_BANK': 'Missing (Bank)',
      'MISSING_IN_UPLOAD': 'Missing (Upload)'
    };
    return labels[status] || status;
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reconciliation records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/reconciliation/${batchId}`)}
              className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reconciliation Records</h1>
              <p className="text-gray-600 mt-1">Individual beneficiary reconciliation details</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export Records
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by beneficiary ID, name, Aadhaar, or account..."
                value={filters.searchQuery}
                onChange={(e) => {
                  setFilters({ ...filters, searchQuery: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4">
              <FiltersComponent filters={filters} onChange={setFilters} />
            </div>
          )}
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Beneficiary</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Account</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Penny Drop</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Payment Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Match Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Issues</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900">{record.name}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {record.beneficiaryId}</div>
                        <div className="text-xs text-gray-500">Aadhaar: {record.aadhaarNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-xs font-semibold text-gray-900">{record.accountNumber}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Amount: ₹{(record.uploadedAmount / 100000).toFixed(0)}L
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          {record.pennyDropStatus === 'SUCCESS' ? (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-xs font-semibold text-green-700">Success</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-red-600" />
                              <span className="text-xs font-semibold text-red-700">Failed</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPaymentStatusColor(record.bankPaymentStatus)}`}>
                          {record.bankPaymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getMatchStatusIcon(record.matchStatus)}
                          <span className="text-xs font-semibold text-gray-700">
                            {getMatchStatusLabel(record.matchStatus)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {record.requiresInvestigation ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 rounded text-xs font-semibold text-red-700">
                            <AlertTriangle className="w-3 h-3" />
                            {record.issues.length} Issue(s)
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                          className="p-2 hover:bg-gray-200 rounded inline-flex"
                        >
                          <ChevronDown
                            className={`w-4 h-4 text-gray-600 transition-transform ${
                              expandedRow === record.id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                      </td>
                    </tr>

                    {expandedRow === record.id && (
                      <tr className="bg-gray-50 border-t border-gray-200">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Upload Data</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-gray-600">Status:</span> <span className="font-semibold">{record.wasUploaded ? 'Uploaded' : 'Not Uploaded'}</span></p>
                                  <p><span className="text-gray-600">Amount:</span> <span className="font-semibold">₹{(record.uploadedAmount / 100000).toFixed(0)}L</span></p>
                                  <p><span className="text-gray-600">Date:</span> <span className="font-semibold">{new Date(record.uploadDate).toLocaleDateString('en-IN')}</span></p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">Bank Payment Data</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-gray-600">Found:</span> <span className="font-semibold">{record.bankPaymentFound ? 'Yes' : 'No'}</span></p>
                                  <p><span className="text-gray-600">Amount Paid:</span> <span className="font-semibold">₹{(record.bankPaidAmount / 100000).toFixed(0)}L</span></p>
                                  {record.rejectionReason && (
                                    <p><span className="text-gray-600">Reason:</span> <span className="font-semibold text-red-600">{record.rejectionReason}</span></p>
                                  )}
                                </div>
                              </div>

                              {record.issues.length > 0 && (
                                <div className="md:col-span-2">
                                  <h4 className="font-semibold text-gray-900 mb-2">Issues Detected</h4>
                                  <div className="space-y-1">
                                    {record.issues.map((issue, idx) => (
                                      <div key={idx} className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">{issue}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} records
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReconciliationRecords;