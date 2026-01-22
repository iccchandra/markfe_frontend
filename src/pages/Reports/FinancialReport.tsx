import { Download, DollarSign, CheckCircle, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { useState } from "react";

export const FinancialReport: React.FC = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('this-quarter');
  
    const financialStats = {
      totalExpected: 562500000000,
      totalPaid: 547800000000,
      variance: -14700000000,
      variancePercentage: -2.61,
      reconciliationRate: 99.8
    };
  
    const stageFinancials = [
      {
        stage: 'BL',
        uploaded: 180000,
        expected: 180000000000,
        paid: 176400000000,
        variance: -3600000000,
        variancePercent: -2.0,
        successRate: 98.0
      },
      {
        stage: 'RL',
        uploaded: 140000,
        expected: 140000000000,
        paid: 137200000000,
        variance: -2800000000,
        variancePercent: -2.0,
        successRate: 98.0
      },
      {
        stage: 'RC',
        uploaded: 120000,
        expected: 240000000000,
        paid: 232800000000,
        variance: -7200000000,
        variancePercent: -3.0,
        successRate: 97.0
      },
      {
        stage: 'COMPLETED',
        uploaded: 22500,
        expected: 22500000000,
        paid: 21400000000,
        variance: -1100000000,
        variancePercent: -4.9,
        successRate: 95.1
      }
    ];
  
    const monthlyDisbursement = [
      { month: 'Apr', expected: 75000000000, paid: 73500000000, variance: -1500000000 },
      { month: 'May', expected: 82000000000, paid: 80100000000, variance: -1900000000 },
      { month: 'Jun', expected: 78000000000, paid: 76100000000, variance: -1900000000 },
      { month: 'Jul', expected: 85000000000, paid: 82900000000, variance: -2100000000 },
      { month: 'Aug', expected: 90000000000, paid: 87600000000, variance: -2400000000 },
      { month: 'Sep', expected: 88000000000, paid: 85800000000, variance: -2200000000 },
      { month: 'Oct', expected: 64500000000, paid: 61800000000, variance: -2700000000 }
    ];
  
    const districtFinancials = [
      { district: 'Hyderabad', beneficiaries: 45000, expected: 225000000000, paid: 220500000000, variance: -4500000000 },
      { district: 'Warangal', beneficiaries: 38000, expected: 190000000000, paid: 185400000000, variance: -4600000000 },
      { district: 'Karimnagar', beneficiaries: 42000, expected: 210000000000, paid: 205800000000, variance: -4200000000 },
      { district: 'Nizamabad', beneficiaries: 35000, expected: 175000000000, paid: 171500000000, variance: -3500000000 },
      { district: 'Others', beneficiaries: 85000, expected: 425000000000, paid: 416300000000, variance: -8700000000 }
    ];
  
    const formatCurrency = (amount: number) => {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    };
  
    return (
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Reconciliation Report</h1>
            <p className="text-gray-600">Payment reconciliation and variance analysis</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="this-month">This Month</option>
              <option value="this-quarter">This Quarter</option>
              <option value="last-quarter">Last Quarter</option>
              <option value="this-year">This Year</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
  
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Expected Amount</p>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialStats.totalExpected)}</p>
            <p className="text-sm text-gray-500 mt-1">Total planned</p>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Amount Paid</p>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(financialStats.totalPaid)}</p>
            <p className="text-sm text-green-600 mt-1">Successfully disbursed</p>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Variance</p>
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(financialStats.variance)}</p>
            <p className="text-sm text-red-600 mt-1">{financialStats.variancePercentage}%</p>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Reconciliation Rate</p>
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{financialStats.reconciliationRate}%</p>
            <p className="text-sm text-purple-600 mt-1">Excellent match</p>
          </div>
  
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(Math.abs(financialStats.variance))}</p>
            <p className="text-sm text-orange-600 mt-1">To be processed</p>
          </div>
        </div>
  
        {/* Stage-wise Financial Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Stage-wise Financial Analysis</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiaries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stageFinancials.map((stage) => (
                  <tr key={stage.stage} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        stage.stage === 'BL' ? 'bg-blue-100 text-blue-800' :
                        stage.stage === 'RL' ? 'bg-yellow-100 text-yellow-800' :
                        stage.stage === 'RC' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {stage.stage}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{stage.uploaded.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(stage.expected)}</td>
                    <td className="px-6 py-4 text-sm text-green-600">{formatCurrency(stage.paid)}</td>
                    <td className="px-6 py-4 text-sm text-red-600">
                      {formatCurrency(stage.variance)} ({stage.variancePercent}%)
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        stage.successRate >= 98 ? 'bg-green-100 text-green-800' :
                        stage.successRate >= 95 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {stage.successRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  
        {/* Monthly Disbursement Trend */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Disbursement Trend</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {monthlyDisbursement.map((month, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{month.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(month.expected)}</td>
                    <td className="px-6 py-4 text-sm text-green-600">{formatCurrency(month.paid)}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{formatCurrency(month.variance)}</td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(month.paid / month.expected) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
  
        {/* District-wise Financial Performance */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">District-wise Financial Performance</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiaries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {districtFinancials.map((district, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{district.district}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{district.beneficiaries.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(district.expected)}</td>
                    <td className="px-6 py-4 text-sm text-green-600">{formatCurrency(district.paid)}</td>
                    <td className="px-6 py-4 text-sm text-red-600">{formatCurrency(district.variance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };