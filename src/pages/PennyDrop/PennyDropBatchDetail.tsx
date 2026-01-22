// ============================================
// pages/PennyDrop/PennyDropBatchDetail.tsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Users,
  FileSpreadsheet,
  TrendingUp,
  AlertCircle,
  Eye
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const PennyDropBatchDetail: React.FC = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBatchDetail();
  }, [batchId]);

  const fetchBatchDetail = async () => {
    try {
      setLoading(true);
      // Mock detailed batch data
      const mockBatch = {
        id: batchId,
        batchId: 'BATCH20250115001',
        uploadDate: '2025-01-15T10:30:00Z',
        processedDate: '2025-01-15T11:45:00Z',
        uploadedBy: 'admin@indiramma.gov',
        
        totalRecords: 450000,
        withPennyDrop: 445000,
        withoutPennyDrop: 5000,
        pennyDropSuccess: 443250,
        pennyDropFailed: 1750,
        successRate: 99.61,
        
        // Breakdown of failures
        failureReasons: [
          { reason: 'Invalid Account Number', count: 680, percentage: 38.9 },
          { reason: 'Account Closed/Dormant', count: 520, percentage: 29.7 },
          { reason: 'Name Mismatch', count: 350, percentage: 20.0 },
          { reason: 'IFSC Error', count: 150, percentage: 8.6 },
          { reason: 'Other', count: 50, percentage: 2.8 }
        ],
        
        // Bank-wise distribution
        bankDistribution: [
          { bank: 'SBI', total: 150000, success: 149500, failed: 500 },
          { bank: 'HDFC', total: 100000, success: 99700, failed: 300 },
          { bank: 'ICICI', total: 80000, success: 79500, failed: 500 },
          { bank: 'Union Bank', total: 60000, success: 59800, failed: 200 },
          { bank: 'Others', total: 55000, success: 54750, failed: 250 }
        ],
        
        validatedFileGenerated: true,
        pendingFileGenerated: true,
        
        status: 'Processed'
      };
      setBatch(mockBatch);
    } catch (error) {
      console.error('Failed to fetch batch detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading batch details...</p>
        </div>
      </div>
    );
  }

  if (!batch) {
    return <div className="text-center py-12"><p className="text-gray-600">Batch not found</p></div>;
  }

  const pieData = [
    { name: 'Success', value: batch.pennyDropSuccess, color: '#10b981' },
    { name: 'Failed', value: batch.pennyDropFailed, color: '#ef4444' },
    { name: 'No Penny Drop', value: batch.withoutPennyDrop, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/penny-drop/batches')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{batch.batchId}</h1>
            <p className="text-gray-600 mt-1">
              Uploaded on {new Date(batch.uploadDate).toLocaleString('en-IN')} by {batch.uploadedBy}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/penny-drop/batch/${batchId}/beneficiaries`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            View All Beneficiaries
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileSpreadsheet className="w-6 h-6" />}
          label="Total Records"
          value={batch.totalRecords.toLocaleString()}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Penny Drop Success"
          value={batch.pennyDropSuccess.toLocaleString()}
          subtext={`${((batch.pennyDropSuccess / batch.withPennyDrop) * 100).toFixed(2)}%`}
          color="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          icon={<XCircle className="w-6 h-6" />}
          label="Penny Drop Failed"
          value={batch.pennyDropFailed.toLocaleString()}
          subtext={`${((batch.pennyDropFailed / batch.withPennyDrop) * 100).toFixed(2)}%`}
          color="bg-red-50"
          iconColor="text-red-600"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="No Penny Drop"
          value={batch.withoutPennyDrop.toLocaleString()}
          subtext="Needs external processing"
          color="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      {/* Download Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DownloadCard
          title="Validated Excel"
          description="Ready for payment processing"
          count={batch.pennyDropSuccess}
          icon={<CheckCircle className="w-6 h-6 text-green-600" />}
          color="bg-green-50 border-green-200"
          available={batch.validatedFileGenerated}
          onDownload={() => alert(`Downloading validated file for ${batch.batchId}`)}
        />
        <DownloadCard
          title="Pending Penny Drop Excel"
          description="Send to external penny drop service"
          count={batch.withoutPennyDrop}
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          color="bg-orange-50 border-orange-200"
          available={batch.pendingFileGenerated}
          onDownload={() => alert(`Downloading pending file for ${batch.batchId}`)}
        />
        <DownloadCard
          title="Rejected Records Excel"
          description="Failed penny drop - needs correction"
          count={batch.pennyDropFailed}
          icon={<XCircle className="w-6 h-6 text-red-600" />}
          color="bg-red-50 border-red-200"
          available={true}
          onDownload={() => alert(`Downloading rejected file for ${batch.batchId}`)}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 rounded-t-lg">
        <div className="flex gap-8 px-6">
          {['overview', 'failures', 'banks'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Distribution Pie Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Penny Drop Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value.toLocaleString()}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Processing Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Processing Summary</h3>
              <div className="space-y-4">
                <SummaryRow
                  label="Total Records Uploaded"
                  value={batch.totalRecords.toLocaleString()}
                  percentage={100}
                  color="bg-gray-200"
                />
                <SummaryRow
                  label="With Penny Drop (Pre-validated)"
                  value={batch.withPennyDrop.toLocaleString()}
                  percentage={(batch.withPennyDrop / batch.totalRecords) * 100}
                  color="bg-blue-500"
                />
                <SummaryRow
                  label="└─ Penny Drop Success (Ready for Payment)"
                  value={batch.pennyDropSuccess.toLocaleString()}
                  percentage={(batch.pennyDropSuccess / batch.totalRecords) * 100}
                  color="bg-green-500"
                  indent
                />
                <SummaryRow
                  label="└─ Penny Drop Failed (Rejected)"
                  value={batch.pennyDropFailed.toLocaleString()}
                  percentage={(batch.pennyDropFailed / batch.totalRecords) * 100}
                  color="bg-red-500"
                  indent
                />
                <SummaryRow
                  label="Without Penny Drop (Needs Processing)"
                  value={batch.withoutPennyDrop.toLocaleString()}
                  percentage={(batch.withoutPennyDrop / batch.totalRecords) * 100}
                  color="bg-orange-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'failures' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Failure Reason Breakdown</h3>
              <p className="text-sm text-gray-600 mb-6">
                Total Failed: <strong>{batch.pennyDropFailed.toLocaleString()}</strong> records
              </p>
              <div className="space-y-4">
                {batch.failureReasons.map((item: any, index: number) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.reason}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{item.count.toLocaleString()}</span>
                        <span className="text-xs text-gray-600 ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-red-500 h-3 rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action to view failed beneficiaries */}
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-red-900">View Failed Beneficiaries</h3>
                  <p className="text-sm text-red-800 mt-1">
                    Click below to see detailed list of all {batch.pennyDropFailed.toLocaleString()} beneficiaries with failed penny drop
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/penny-drop/batch/${batchId}/beneficiaries?filter=failed`)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <Eye className="w-4 h-4" />
                  View Failed
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Bank-wise Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={batch.bankDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bank" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="success" fill="#10b981" name="Success" />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bank Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Success</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Failed</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Success Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {batch.bankDistribution.map((bank: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{bank.bank}</td>
                        <td className="px-6 py-4 text-gray-900">{bank.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-700">{bank.success.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="font-semibold text-red-700">{bank.failed.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${(bank.success / bank.total) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">
                              {((bank.success / bank.total) * 100).toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/penny-drop/batch/${batchId}/beneficiaries?bank=${bank.bank}`)}
                            className="p-2 hover:bg-indigo-100 rounded text-indigo-600 transition-colors"
                            title="View Beneficiaries"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Components
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
  color: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, color, iconColor }) => (
  <div className={`${color} rounded-lg shadow-sm border border-gray-200 p-6`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`p-3 rounded-lg bg-white ${iconColor}`}>{icon}</div>
    </div>
    <p className="text-sm text-gray-600 mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
    {subtext && <p className="text-xs text-gray-600 mt-1">{subtext}</p>}
  </div>
);

interface DownloadCardProps {
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  available: boolean;
  onDownload: () => void;
}

const DownloadCard: React.FC<DownloadCardProps> = ({
  title,
  description,
  count,
  icon,
  color,
  available,
  onDownload
}) => (
  <div className={`${color} border-2 rounded-lg p-6`}>
    <div className="flex items-start gap-3 mb-4">
      <div className="p-3 bg-white rounded-lg">{icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 my-1">{count.toLocaleString()}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
    <button
      onClick={onDownload}
      disabled={!available}
      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
        available
          ? 'bg-white hover:bg-gray-50 border border-gray-300 text-gray-900'
          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
      }`}
    >
      <Download className="w-4 h-4" />
      {available ? 'Download Excel' : 'Not Available'}
    </button>
  </div>
);

interface SummaryRowProps {
  label: string;
  value: string;
  percentage: number;
  color: string;
  indent?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, percentage, color, indent }) => (
  <div className={indent ? 'pl-6' : ''}>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <div className="text-right">
        <span className="text-sm font-bold text-gray-900">{value}</span>
        <span className="text-xs text-gray-600 ml-2">({percentage.toFixed(2)}%)</span>
      </div>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

export default PennyDropBatchDetail;