// ============================================
// pages/PennyDrop/PennyDropModule.tsx
// ============================================
import React, { useState, useEffect } from 'react';
import {
  Upload,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Users,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  ArrowRight,
  Clock
} from 'lucide-react';

export const PennyDropModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data
  const pennyDropStats = {
    totalUploaded: 450000,
    withPennyDrop: 445000,
    withoutPennyDrop: 5000,
    pennyDropSuccess: 443250,
    pennyDropFailed: 1750,
    successRate: 99.61,
    pendingValidation: 5000
  };

  const processingResults = {
    validated: 445000,
    readyForPayment: 443250,
    pendingPennyDrop: 5000,
    rejectedRecords: 1750
  };

  const pennyDropBatches = [
    {
      id: 1,
      batchId: 'BATCH20250115001',
      uploadDate: '2025-01-15T10:30:00Z',
      totalRecords: 450000,
      withPennyDrop: 445000,
      withoutPennyDrop: 5000,
      pennyDropSuccess: 443250,
      pennyDropFailed: 1750,
      status: 'Processed',
      validatedFileGenerated: true,
      pendingFileGenerated: true
    },
    {
      id: 2,
      batchId: 'BATCH20250114002',
      uploadDate: '2025-01-14T09:15:00Z',
      totalRecords: 420000,
      withPennyDrop: 418500,
      withoutPennyDrop: 1500,
      pennyDropSuccess: 417200,
      pennyDropFailed: 1300,
      status: 'Processed',
      validatedFileGenerated: true,
      pendingFileGenerated: true
    },
    {
      id: 3,
      batchId: 'BATCH20250113003',
      uploadDate: '2025-01-13T08:45:00Z',
      totalRecords: 380000,
      withPennyDrop: 375000,
      withoutPennyDrop: 5000,
      pennyDropSuccess: 373500,
      pennyDropFailed: 1500,
      status: 'Processed',
      validatedFileGenerated: true,
      pendingFileGenerated: true
    }
  ];

  const rejectionReasons = [
    { reason: 'Invalid Account Number', count: 680, percentage: 38.9 },
    { reason: 'Account Closed/Dormant', count: 520, percentage: 29.7 },
    { reason: 'Name Mismatch', count: 350, percentage: 20.0 },
    { reason: 'IFSC Error', count: 150, percentage: 8.6 },
    { reason: 'Other', count: 50, percentage: 2.8 }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setProcessing(true);
      // Simulate processing
      setTimeout(() => {
        setProcessing(false);
      }, 2000);
    }
  };

  const handleDownload = (fileType: string) => {
    alert(`Downloading ${fileType} file...`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Penny Drop Management</h1>
          <p className="text-gray-600 mt-1">Validate and categorize beneficiary records by penny drop status</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Important Note</h3>
            <p className="text-sm text-blue-800 mt-1">
              This system does NOT perform penny drop verification. It validates and categorizes records, then generates:
              <br />• <strong>Validated Excel</strong> - Records with successful penny drop (ready for payment)
              <br />• <strong>Pending Penny Drop Excel</strong> - Records needing external penny drop processing
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Uploaded"
          value={pennyDropStats.totalUploaded.toLocaleString()}
          color="bg-gray-50"
          iconColor="text-gray-600"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="With Penny Drop"
          value={pennyDropStats.withPennyDrop.toLocaleString()}
          subtext={`${((pennyDropStats.withPennyDrop / pennyDropStats.totalUploaded) * 100).toFixed(1)}%`}
          color="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          icon={<AlertCircle className="w-6 h-6" />}
          label="Without Penny Drop"
          value={pennyDropStats.withoutPennyDrop.toLocaleString()}
          subtext={`${((pennyDropStats.withoutPennyDrop / pennyDropStats.totalUploaded) * 100).toFixed(1)}%`}
          color="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Success Rate"
          value={`${pennyDropStats.successRate}%`}
          subtext={`${pennyDropStats.pennyDropSuccess.toLocaleString()} successful`}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 rounded-t-lg">
        <div className="flex gap-8 px-6">
          {['overview', 'upload', 'batches', 'reports'].map((tab) => (
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
            {/* Processing Flow */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Processing Flow</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FlowStep
                  number="1"
                  title="Upload Excel"
                  description="Upload raw beneficiary data"
                  icon={<Upload className="w-5 h-5" />}
                  color="bg-blue-100 text-blue-600"
                />
                <FlowStep
                  number="2"
                  title="Validate Data"
                  description="Check all fields"
                  icon={<FileText className="w-5 h-5" />}
                  color="bg-purple-100 text-purple-600"
                  showArrow
                />
                <FlowStep
                  number="3"
                  title="Categorize"
                  description="With/Without penny drop"
                  icon={<Filter className="w-5 h-5" />}
                  color="bg-yellow-100 text-yellow-600"
                  showArrow
                />
                <FlowStep
                  number="4"
                  title="Generate Files"
                  description="2 separate Excel files"
                  icon={<FileSpreadsheet className="w-5 h-5" />}
                  color="bg-green-100 text-green-600"
                  showArrow
                />
                <FlowStep
                  number="5"
                  title="Download"
                  description="Ready for next steps"
                  icon={<Download className="w-5 h-5" />}
                  color="bg-indigo-100 text-indigo-600"
                  showArrow
                />
              </div>
            </div>

            {/* Processing Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Processing Results</h3>
                <div className="space-y-4">
                  <ResultRow
                    label="Total Validated"
                    value={processingResults.validated.toLocaleString()}
                    color="text-blue-600"
                    percentage={100}
                  />
                  <ResultRow
                    label="Ready for Payment"
                    value={processingResults.readyForPayment.toLocaleString()}
                    color="text-green-600"
                    percentage={(processingResults.readyForPayment / processingResults.validated) * 100}
                  />
                  <ResultRow
                    label="Pending Penny Drop"
                    value={processingResults.pendingPennyDrop.toLocaleString()}
                    color="text-orange-600"
                    percentage={(processingResults.pendingPennyDrop / processingResults.validated) * 100}
                  />
                  <ResultRow
                    label="Rejected Records"
                    value={processingResults.rejectedRecords.toLocaleString()}
                    color="text-red-600"
                    percentage={(processingResults.rejectedRecords / processingResults.validated) * 100}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Rejection Breakdown</h3>
                <div className="space-y-3">
                  {rejectionReasons.map((item, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.reason}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-gray-900">{item.count}</span>
                          <span className="text-xs text-gray-600 ml-2">({item.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Upload Beneficiary Data</h3>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-400 transition-colors">
                <input
                  type="file"
                  id="fileUpload"
                  className="hidden"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  {processing ? (
                    <div className="space-y-4">
                      <RefreshCw className="w-12 h-12 text-indigo-600 mx-auto animate-spin" />
                      <p className="text-lg font-medium text-gray-900">Processing file...</p>
                      <p className="text-sm text-gray-600">Validating data and identifying penny drop status</p>
                    </div>
                  ) : uploadedFile ? (
                    <div className="space-y-4">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                      <p className="text-lg font-medium text-gray-900">File Uploaded: {uploadedFile.name}</p>
                      <p className="text-sm text-gray-600">Click to upload a different file</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-600">Excel files (.xlsx, .xls) up to 50MB</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {uploadedFile && !processing && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-900">Processing Complete!</h4>
                      <p className="text-sm text-green-800 mt-1">
                        File validated successfully. Download the generated files below.
                      </p>
                      <div className="mt-4 space-y-2">
                        <button
                          onClick={() => handleDownload('validated')}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Validated Excel (Ready for Payment)
                        </button>
                        <button
                          onClick={() => handleDownload('pending')}
                          className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Pending Penny Drop Excel
                        </button>
                        <button
                          onClick={() => handleDownload('report')}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Validation Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Instructions</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex gap-3">
                  <span className="font-bold text-indigo-600">1.</span>
                  <p>Upload Excel file with beneficiary data including penny drop status column</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-indigo-600">2.</span>
                  <p>System validates all data fields and categorizes by penny drop status</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-indigo-600">3.</span>
                  <p>Download <strong>Validated Excel</strong> for records with successful penny drop</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-indigo-600">4.</span>
                  <p>Download <strong>Pending Penny Drop Excel</strong> and send to external penny drop service</p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-indigo-600">5.</span>
                  <p>After external penny drop is complete, re-upload results to merge with validated records</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by batch ID..."
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
                  <option value="processed">Processed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Batches List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Batch ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Records</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">With Penny Drop</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Without Penny Drop</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Success Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pennyDropBatches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-indigo-600">{batch.batchId}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(batch.uploadDate).toLocaleDateString('en-IN')}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{batch.totalRecords.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-gray-900">{batch.withPennyDrop.toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Success: {batch.pennyDropSuccess.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-600" />
                            <span className="font-medium text-gray-900">{batch.withoutPennyDrop.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-green-600">
                            {((batch.pennyDropSuccess / batch.withPennyDrop) * 100).toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            {batch.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDownload(`validated-${batch.batchId}`)}
                              className="p-2 hover:bg-green-100 rounded text-green-600 transition-colors"
                              title="Download Validated Excel"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(`pending-${batch.batchId}`)}
                              className="p-2 hover:bg-orange-100 rounded text-orange-600 transition-colors"
                              title="Download Pending Penny Drop Excel"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded text-gray-600 transition-colors" title="View Details">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Available Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ReportCard
                  title="Penny Drop Summary Report"
                  description="Complete analysis of penny drop success/failure rates"
                  icon={<FileText className="w-6 h-6 text-blue-600" />}
                  onDownload={() => handleDownload('penny-drop-summary')}
                />
                <ReportCard
                  title="Validation Error Report"
                  description="Detailed list of validation failures and reasons"
                  icon={<XCircle className="w-6 h-6 text-red-600" />}
                  onDownload={() => handleDownload('validation-errors')}
                />
                <ReportCard
                  title="Data Quality Report"
                  description="Overall data quality metrics and scores"
                  icon={<TrendingUp className="w-6 h-6 text-green-600" />}
                  onDownload={() => handleDownload('data-quality')}
                />
                <ReportCard
                  title="Batch Processing Report"
                  description="Batch-wise processing statistics and timelines"
                  icon={<Clock className="w-6 h-6 text-purple-600" />}
                  onDownload={() => handleDownload('batch-processing')}
                />
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

interface FlowStepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  showArrow?: boolean;
}

const FlowStep: React.FC<FlowStepProps> = ({ number, title, description, icon, color, showArrow }) => (
  <div className="relative">
    <div className="bg-white rounded-lg shadow-sm border-2 border-gray-200 p-4 text-center">
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-3`}>
        {icon}
      </div>
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{title}</h4>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
    {showArrow && (
      <ArrowRight className="hidden md:block w-6 h-6 text-gray-400 absolute top-1/2 -right-5 transform -translate-y-1/2" />
    )}
  </div>
);

interface ResultRowProps {
  label: string;
  value: string;
  color: string;
  percentage: number;
}

const ResultRow: React.FC<ResultRowProps> = ({ label, value, color, percentage }) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-indigo-600 h-2 rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

interface ReportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onDownload: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ title, description, icon, onDownload }) => (
  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-indigo-300 transition-colors">
    <div className="flex items-start gap-4">
      <div className="p-3 bg-white rounded-lg">{icon}</div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <button
          onClick={onDownload}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>
    </div>
  </div>
);

export default PennyDropModule;