// ============================================
// pages/PennyDrop/PennyDropBatchList.tsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Search,
  Filter,
  Eye,
  FileSpreadsheet,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export const PennyDropBatchList: React.FC = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPennyDropBatches();
  }, []);

  const fetchPennyDropBatches = async () => {
    try {
      setLoading(true);
      const mockBatches = [
        {
          id: '1',
          batchId: 'BATCH20250115001',
          uploadDate: '2025-01-15T10:30:00Z',
          processedDate: '2025-01-15T11:45:00Z',
          uploadedBy: 'admin@indiramma.gov',
          
          // Total uploaded
          totalRecords: 450000,
          
          // Penny drop categorization
          withPennyDrop: 445000,
          withoutPennyDrop: 5000,
          
          // Of those WITH penny drop, success/failure breakdown
          pennyDropSuccess: 443250,
          pennyDropFailed: 1750,
          
          // Success rate
          successRate: 99.61,
          
          // File generation status
          validatedFileGenerated: true,
          pendingFileGenerated: true,
          
          status: 'Processed'
        },
        {
          id: '2',
          batchId: 'BATCH20250114002',
          uploadDate: '2025-01-14T09:15:00Z',
          processedDate: '2025-01-14T10:30:00Z',
          uploadedBy: 'officer@indiramma.gov',
          
          totalRecords: 420000,
          withPennyDrop: 418500,
          withoutPennyDrop: 1500,
          pennyDropSuccess: 417200,
          pennyDropFailed: 1300,
          successRate: 99.69,
          
          validatedFileGenerated: true,
          pendingFileGenerated: true,
          
          status: 'Processed'
        },
        {
          id: '3',
          batchId: 'BATCH20250113003',
          uploadDate: '2025-01-13T08:45:00Z',
          processedDate: '2025-01-13T10:00:00Z',
          uploadedBy: 'finance@indiramma.gov',
          
          totalRecords: 380000,
          withPennyDrop: 375000,
          withoutPennyDrop: 5000,
          pennyDropSuccess: 373500,
          pennyDropFailed: 1500,
          successRate: 99.60,
          
          validatedFileGenerated: true,
          pendingFileGenerated: true,
          
          status: 'Processed'
        },
        {
          id: '4',
          batchId: 'BATCH20250112004',
          uploadDate: '2025-01-12T07:20:00Z',
          processedDate: null,
          uploadedBy: 'officer@indiramma.gov',
          
          totalRecords: 350000,
          withPennyDrop: 0,
          withoutPennyDrop: 0,
          pennyDropSuccess: 0,
          pennyDropFailed: 0,
          successRate: 0,
          
          validatedFileGenerated: false,
          pendingFileGenerated: false,
          
          status: 'Processing'
        }
      ];
      setBatches(mockBatches);
    } catch (error) {
      console.error('Failed to fetch penny drop batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBatches = batches.filter(batch => {
    let matchesFilter = true;
    if (filterStatus !== 'all') {
      matchesFilter = batch.status === filterStatus;
    }
    const matchesSearch = searchQuery === '' ||
      batch.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    totalBatches: batches.length,
    processedBatches: batches.filter(b => b.status === 'Processed').length,
    totalRecords: batches.reduce((sum, b) => sum + b.totalRecords, 0),
    totalSuccess: batches.reduce((sum, b) => sum + b.pennyDropSuccess, 0),
    totalFailed: batches.reduce((sum, b) => sum + b.pennyDropFailed, 0),
    overallSuccessRate: batches.length > 0 
      ? (batches.reduce((sum, b) => sum + b.pennyDropSuccess, 0) / 
         batches.reduce((sum, b) => sum + b.withPennyDrop, 0) * 100).toFixed(2)
      : 0
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading penny drop batches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Penny Drop Batches</h1>
        <p className="mt-2 text-gray-600">View all uploaded batches and their penny drop validation status</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileSpreadsheet className="w-6 h-6" />}
          label="Total Batches"
          value={stats.totalBatches}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Records"
          value={(stats.totalRecords / 100000).toFixed(1) + 'L'}
          color="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Total Success"
          value={(stats.totalSuccess / 100000).toFixed(1) + 'L'}
          color="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Success Rate"
          value={stats.overallSuccessRate + '%'}
          color="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by batch ID or uploaded by..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="Processed">Processed</option>
            <option value="Processing">Processing</option>
          </select>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Batch ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Records</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">With Penny Drop</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Without Penny Drop</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Success / Failed</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Success Rate</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBatches.map((batch) => (
                <tr 
                  key={batch.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/penny-drop/batch/${batch.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-indigo-600 hover:text-indigo-700">{batch.batchId}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(batch.uploadDate).toLocaleDateString('en-IN')} {new Date(batch.uploadDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-gray-500">By: {batch.uploadedBy}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{batch.totalRecords.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-gray-900">{batch.withPennyDrop.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {batch.withPennyDrop > 0 ? ((batch.withPennyDrop / batch.totalRecords) * 100).toFixed(1) : 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-gray-900">{batch.withoutPennyDrop.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {batch.withoutPennyDrop > 0 ? ((batch.withoutPennyDrop / batch.totalRecords) * 100).toFixed(1) : 0}%
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">{batch.pennyDropSuccess.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-3 h-3 text-red-600" />
                        <span className="text-sm font-semibold text-red-700">{batch.pennyDropFailed.toLocaleString()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${batch.successRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{batch.successRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      batch.status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/penny-drop/batch/${batch.id}`);
                        }}
                        className="p-2 hover:bg-indigo-100 rounded text-indigo-600 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Downloading files for ${batch.batchId}`);
                        }}
                        className="p-2 hover:bg-green-100 rounded text-green-600 transition-colors"
                        title="Download Files"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/penny-drop/batch/${batch.id}/beneficiaries`);
                        }}
                        className="p-2 hover:bg-purple-100 rounded text-purple-600 transition-colors"
                        title="View Beneficiaries"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">Navigation Guide</h3>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• <strong>Click on Batch ID</strong> to view detailed batch information</li>
              <li>• <strong>Click Eye icon</strong> to see batch details and statistics</li>
              <li>• <strong>Click Users icon</strong> to view all beneficiaries in the batch</li>
              <li>• <strong>Click Download icon</strong> to export validated and pending files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Components
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: any;
  color: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, iconColor }) => (
  <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-6`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-lg bg-white ${iconColor}`}>{icon}</div>
    </div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

export default PennyDropBatchList;