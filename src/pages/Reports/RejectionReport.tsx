import { Download, XCircle, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { useState } from "react";

export const RejectionReport: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  
    const rejectionStats = {
      totalRejections: 8450,
      rejectionRate: 3.78,
      totalAmount: 169000000000,
      criticalIssues: 15
    };
  
    const rejectionBreakdown = [
      { code: '58', reason: 'Credit limit exceeded', count: 2840, percentage: 33.6, amount: 56800000000 },
      { code: 'INV_ACC', reason: 'Invalid account number', count: 1690, percentage: 20.0, amount: 33800000000 },
      { code: 'ACC_CLOSED', reason: 'Account closed/dormant', count: 1520, percentage: 18.0, amount: 30400000000 },
      { code: 'NAME_MIS', reason: 'Name mismatch', count: 1180, percentage: 14.0, amount: 23600000000 },
      { code: 'IFSC_ERR', reason: 'IFSC code incorrect', count: 760, percentage: 9.0, amount: 15200000000 },
      { code: 'OTHER', reason: 'Other errors', count: 460, percentage: 5.4, amount: 9200000000 }
    ];
  
    const trendData = [
      { month: 'Apr', rejections: 7200, rate: 3.2 },
      { month: 'May', rejections: 7800, rate: 3.5 },
      { month: 'Jun', rejections: 8100, rate: 3.6 },
      { month: 'Jul', rejections: 7500, rate: 3.3 },
      { month: 'Aug', rejections: 8450, rate: 3.8 },
      { month: 'Sep', rejections: 8200, rate: 3.7 },
      { month: 'Oct', rejections: 8450, rate: 3.78 }
    ];
  
    const bankWiseRejections = [
      { bank: 'ICICI Bank', rejections: 2340, rate: 4.2 },
      { bank: 'India Post Payments Bank', rejections: 1890, rate: 3.9 },
      { bank: 'SBI', rejections: 1560, rate: 2.8 },
      { bank: 'HDFC Bank', rejections: 1240, rate: 3.1 },
      { bank: 'Axis Bank', rejections: 920, rate: 3.5 },
      { bank: 'Others', rejections: 500, rate: 2.9 }
    ];
  
    const formatCurrency = (amount: number) => {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    };
  
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rejection Analysis Report</h1>
            <p className="text-gray-600">Comprehensive analysis of payment rejections and patterns</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="this-quarter">This Quarter</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
  
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Rejections</p>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{rejectionStats.totalRejections.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Across all batches</p>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Rejection Rate</p>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{rejectionStats.rejectionRate}%</p>
            <p className="text-sm text-orange-600 mt-1">+0.08% from last month</p>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Amount Affected</p>
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(rejectionStats.totalAmount)}</p>
            <p className="text-sm text-gray-500 mt-1">Pending reprocessing</p>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{rejectionStats.criticalIssues}</p>
            <p className="text-sm text-red-600 mt-1">Require immediate action</p>
          </div>
        </div>
  
        {/* Rejection Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rejection Reason Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rejectionBreakdown.map((item) => (
                  <tr key={item.code} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.count.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.percentage}%</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(item.amount)}</td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Bank-wise Rejection Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank-wise Rejections</h2>
            <div className="space-y-4">
              {bankWiseRejections.map((bank, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{bank.bank}</span>
                    <span className="text-sm text-gray-600">{bank.rejections.toLocaleString()} ({bank.rate}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${(bank.rejections / rejectionStats.totalRejections) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Trend</h2>
            <div className="space-y-3">
              {trendData.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 w-16">{month.month}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          month.rate > 3.7 ? 'bg-red-600' :
                          month.rate > 3.4 ? 'bg-orange-600' :
                          'bg-yellow-600'
                        }`}
                        style={{ width: `${(month.rate / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-24 text-right">{month.rejections.toLocaleString()}</span>
                  <span className="text-sm font-semibold text-gray-900 w-16 text-right">{month.rate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Action Items */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommended Actions</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">High Credit Limit Rejections (33.6%)</p>
                <p className="text-xs text-gray-600">Coordinate with banks to increase credit limits for beneficiary accounts</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Invalid Account Numbers (20%)</p>
                <p className="text-xs text-gray-600">Implement stricter validation at upload stage to catch format errors</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Closed/Dormant Accounts (18%)</p>
                <p className="text-xs text-gray-600">Cross-verify account status during penny drop phase before processing payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  