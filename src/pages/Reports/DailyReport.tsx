import React, { useState } from 'react';
import { Download, Calendar, Filter, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

export const DailyReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const dailyStats = {
    batchesProcessed: 5,
    totalRecords: 125000,
    validRecords: 123450,
    invalidRecords: 1550,
    pennyDropVerified: 120000,
    pennyDropFailed: 3000,
    pennyDropPending: 2000,
    dataQualityScore: 98.76
  };

  const stageDistribution = [
    { stage: 'BL', count: 45000, amount: 450000000000, percentage: 36 },
    { stage: 'RL', count: 35000, amount: 350000000000, percentage: 28 },
    { stage: 'RC', count: 30000, amount: 600000000000, percentage: 24 },
    { stage: 'COMPLETED', count: 15000, amount: 150000000000, percentage: 12 }
  ];

  const batchDetails = [
    {
      batchId: 'BATCH20250117001',
      uploadTime: '09:30 AM',
      totalRecords: 45000,
      valid: 44500,
      invalid: 500,
      pennyDropVerified: 44000,
      pennyDropFailed: 500,
      dataQuality: 98.9,
      status: 'BL'
    },
    {
      batchId: 'BATCH20250117002',
      uploadTime: '11:15 AM',
      totalRecords: 30000,
      valid: 29800,
      invalid: 200,
      pennyDropVerified: 29600,
      pennyDropFailed: 200,
      dataQuality: 99.3,
      status: 'RL'
    },
    {
      batchId: 'BATCH20250117003',
      uploadTime: '02:45 PM',
      totalRecords: 50000,
      valid: 49150,
      invalid: 850,
      pennyDropVerified: 48400,
      pennyDropFailed: 1750,
      dataQuality: 98.3,
      status: 'BL'
    }
  ];

  const timeline = [
    { time: '10:45 AM', event: 'BATCH003 uploaded', details: '50,000 records', type: 'upload' },
    { time: '10:47 AM', event: 'Validation completed', details: '49,500 valid records', type: 'validation' },
    { time: '10:50 AM', event: 'Penny drop results imported', details: '49,000 verified', type: 'pennydrop' },
    { time: '11:00 AM', event: 'Generated payment-ready Excel', details: 'Ready for bank upload', type: 'export' },
    { time: '11:15 AM', event: 'BATCH002 moved to RL stage', details: '30,000 beneficiaries', type: 'stage' }
  ];

  const formatCurrency = (amount: number) => {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Report</h1>
          <p className="text-gray-600">Daily batch processing and validation summary</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Batches Processed</p>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dailyStats.batchesProcessed}</p>
          <p className="text-sm text-gray-500 mt-1">{dailyStats.totalRecords.toLocaleString()} records</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Valid Records</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dailyStats.validRecords.toLocaleString()}</p>
          <p className="text-sm text-green-600 mt-1">{((dailyStats.validRecords / dailyStats.totalRecords) * 100).toFixed(2)}% success rate</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Penny Drop Verified</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dailyStats.pennyDropVerified.toLocaleString()}</p>
          <p className="text-sm text-purple-600 mt-1">{((dailyStats.pennyDropVerified / dailyStats.totalRecords) * 100).toFixed(2)}% verified</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Data Quality Score</p>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dailyStats.dataQualityScore}%</p>
          <p className="text-sm text-orange-600 mt-1">Excellent quality</p>
        </div>
      </div>

      {/* Stage Distribution */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Stage Distribution</h2>
        <div className="space-y-4">
          {stageDistribution.map((stage) => (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                  <span className="text-sm text-gray-600 ml-2">({stage.count.toLocaleString()} beneficiaries)</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(stage.amount)}</span>
                  <span className="text-sm text-gray-600 ml-2">({stage.percentage}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    stage.stage === 'BL' ? 'bg-blue-600' :
                    stage.stage === 'RL' ? 'bg-yellow-600' :
                    stage.stage === 'RC' ? 'bg-purple-600' :
                    'bg-green-600'
                  }`}
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Batch Details Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Batch-wise Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Records</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invalid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penny Drop Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Quality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {batchDetails.map((batch) => (
                <tr key={batch.batchId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-blue-600">{batch.batchId}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{batch.uploadTime}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{batch.totalRecords.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-green-600">{batch.valid.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-red-600">{batch.invalid.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-purple-600">{batch.pennyDropVerified.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      batch.dataQuality >= 99 ? 'bg-green-100 text-green-800' :
                      batch.dataQuality >= 98 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {batch.dataQuality}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      batch.status === 'BL' ? 'bg-blue-100 text-blue-800' :
                      batch.status === 'RL' ? 'bg-yellow-100 text-yellow-800' :
                      batch.status === 'RC' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Timeline</h2>
        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.time}</p>
                <p className="text-sm text-gray-600">{item.event}</p>
                <p className="text-xs text-gray-500">{item.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};