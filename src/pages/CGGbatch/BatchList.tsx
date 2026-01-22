// ═══════════════════════════════════════════════════════════════════════════
// FILE: BatchList.tsx - CORRECTED FOR VALIDATION CONTROLLER
// Uses lowValidation, mediumValidation, etc. (not lowRisk)
// ═══════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  FileText, 
  Download, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { Batch } from './types/batch.types';
import { batchService } from '../../services/batchService';

export const BatchList: React.FC = () => {
  const navigate = useNavigate();
  
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await batchService.getBatches(page, 20);
      
      console.log('✅ Batches loaded:', data.batches?.length || 0);
      
      setBatches(data.batches || []);
      setTotalPages(data.totalPages || 1);
      
    } catch (err: any) {
      console.error('❌ Error fetching batches:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [page]);

  const handleBatchClick = (batchId: string) => {
    navigate(`/cggbatches/${batchId}`);
  };

  const handleDownload = (url: string, filename: string, event: React.MouseEvent) => {
    event.stopPropagation();
    batchService.downloadFile(url, filename);
  };

  const filteredBatches = batches.filter(batch => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      batch.batchId?.toLowerCase().includes(searchLower) ||
      batch.originalFilename?.toLowerCase().includes(searchLower)
    );
  });

  if (loading && batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading batches...</p>
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
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Batches</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={fetchBatches} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Validation Batches</h1>
        <p className="text-gray-600">View and analyze payment validation results</p>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Batch ID or filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button onClick={fetchBatches} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Batches Table */}
      {filteredBatches.length === 0 ? (
        <div className="bg-white shadow-lg rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Batches Found</h3>
          <p className="text-gray-600">
            {searchTerm ? `No batches match your search "${searchTerm}"` : 'No batches have been uploaded yet'}
          </p>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Batch ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Filename</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Records</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Allowed / Blocked</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Uploaded</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBatches.map((batch) => {
                  const summary = batch.summary || {
                    totalRecords: 0,
                    lowValidation: 0,
                    mediumValidation: 0,
                    highValidation: 0,
                    criticalValidation: 0,
                    allowedToProcess: 0,
                    blocked: 0,
                  };

                  return (
                    <tr 
                      key={batch.id} 
                      onClick={() => handleBatchClick(batch.batchId)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-600">{batch.batchId}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{batch.originalFilename}</div>
                        <div className="text-xs text-gray-500">{batch.processingTime}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {summary.totalRecords.toLocaleString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              {summary.allowedToProcess}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">
                              {summary.blocked}
                            </span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(batch.uploadedAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(batch.uploadedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {batch.downloads?.excelUrl && (
                            <button
                              onClick={(e) => handleDownload(
                                batch.downloads.excelUrl!, 
                                batch.downloads.excelFilename || 'report.xlsx',
                                e
                              )}
                              className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              title="Download Excel"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          {batch.downloads?.jsonUrl && (
                            <button
                              onClick={(e) => handleDownload(
                                batch.downloads.jsonUrl!,
                                batch.downloads.jsonFilename || 'report.json',
                                e
                              )}
                              className="p-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                              title="Download JSON"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
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

export default BatchList;