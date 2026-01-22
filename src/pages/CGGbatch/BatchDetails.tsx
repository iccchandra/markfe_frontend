// ═══════════════════════════════════════════════════════════════════════════
// FILE: BatchDetails.tsx - CORRECTED FOR VALIDATION CONTROLLER
// Uses lowValidation, mediumValidation, etc. (not lowRisk)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw
} from 'lucide-react';
import { BatchDetailsResponse } from './types/batch.types';
import { batchService } from '../../services/batchService';

export const BatchDetails: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const navigate = useNavigate();
  
  const [batchData, setBatchData] = useState<BatchDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBatchDetails = async () => {
    if (!batchId) {
      console.error('❌ No batchId provided in URL params');
      setError('No batch ID provided');
      setLoading(false);
      return;
    }
    
    console.log('🔍 Fetching batch details for:', batchId);
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await batchService.getBatchDetails(batchId, page, 50);
      
      console.log('✅ API Response received');
      
      if (!data || !data.batch || !data.results) {
        throw new Error('Invalid response structure from API');
      }
      
      setBatchData(data);
      
    } catch (err: any) {
      console.error('❌ Error fetching batch details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch batch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchDetails();
  }, [batchId, page]);

  const handleDownload = (url: string, filename: string) => {
    batchService.downloadFile(url, filename);
  };

  const getStatusBadge = (decision: string, isBlocked: boolean) => {
    if (isBlocked || decision === 'BLOCKED') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          <XCircle className="w-4 h-4" />
          Blocked
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        <CheckCircle className="w-4 h-4" />
        Allowed
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount / 100);
  };

  if (loading && !batchData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading batch details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Batch</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="flex gap-3">
                <button onClick={fetchBatchDetails} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Try Again
                </button>
                <button onClick={() => navigate('/cggbatches')} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                  Back to Batches
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!batchData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-900">No Data Available</h3>
              <button onClick={() => navigate('/cggbatches')} className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                Back to Batches
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { batch, summary, results } = batchData;
  
  // ✅ FIXED: Use validation field names (lowValidation, not lowRisk)
  const defaultSummary = {
    totalRecords: 0,
    lowValidation: 0,
    mediumValidation: 0,
    highValidation: 0,
    criticalValidation: 0,
    allowedToProcess: 0,
    blocked: 0,
  };
  
  const safeSummary = summary || batch?.summary || defaultSummary;
  
  // ✅ Extract with correct field names
  const totalRecords = Number(safeSummary?.totalRecords ?? 0) || 0;
  const allowedToProcess = Number(safeSummary?.allowedToProcess ?? 0) || 0;
  const blocked = Number(safeSummary?.blocked ?? 0) || 0;
  
  // ✅ Calculate percentages
  const calculatePercentage = (count: number): string => {
    if (totalRecords === 0) return '0.0';
    return ((count / totalRecords) * 100).toFixed(1);
  };

  // ✅ Filter results
  const filteredResults = (results?.data || []).filter(result => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      result.beneficiaryId?.toLowerCase().includes(searchLower) ||
      result.beneficiaryName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/cggbatches')} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Batches
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{batch.batchId}</h1>
            <p className="text-gray-600 mt-1">{batch.originalFilename}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>Uploaded: {new Date(batch.uploadedAt).toLocaleString()}</span>
              <span>•</span>
              <span>Processing Time: {batch.processingTime}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {batch.downloads?.excelUrl && (
              <button onClick={() => handleDownload(batch.downloads.excelUrl!, batch.downloads.excelFilename || 'report.xlsx')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Download className="w-4 h-4" />
                Download Excel
              </button>
            )}
            {batch.downloads?.jsonUrl && (
              <button onClick={() => handleDownload(batch.downloads.jsonUrl!, batch.downloads.jsonFilename || 'report.json')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <FileText className="w-4 h-4" />
                Download JSON
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{totalRecords.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Allowed</p>
              <p className="text-2xl font-bold text-gray-900">{allowedToProcess.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{calculatePercentage(allowedToProcess)}%</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Blocked</p>
              <p className="text-2xl font-bold text-gray-900">{blocked.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{calculatePercentage(blocked)}%</p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Beneficiary ID or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Results Table */}
      {filteredResults.length === 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-600">
            {searchTerm ? `No beneficiaries match your search "${searchTerm}"` : 'No beneficiary data available'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Beneficiary ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Reason / Issue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredResults.map((result) => (
                  <tr key={result.beneficiaryId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{result.beneficiaryId || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{result.beneficiaryName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{result.aadhaarNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {result.amount ? formatCurrency(result.amount) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {result.stage || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(result.decision, result.isBlocked)}
                    </td>
                    <td className="px-6 py-4">
                      {result.isBlocked || result.decision === 'BLOCKED' ? (
                        <div className="text-sm text-red-700">
                          {result.recommendation || 'Payment blocked - requires review'}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {results && results.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {results.page} of {results.totalPages} • {results.total.toLocaleString()} total results
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(results.totalPages, p + 1))} disabled={page === results.totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchDetails;