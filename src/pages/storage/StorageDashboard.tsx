// ============================================
// pages/storage/StorageDashboard.tsx
// ============================================
import React, { useState } from 'react';
import {
  Warehouse, TrendingUp, MapPin, Package, DollarSign, AlertCircle,
  Plus, Search, Filter, Download, Eye, Edit, BarChart3, Shield,
  Activity, CheckCircle, Calendar, FileText
} from 'lucide-react';

export const StorageDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'godowns' | 'billing' | 'quality'>('godowns');

  // Stats Cards
  const stats = [
    {
      title: 'Total Capacity',
      value: '55,000 MT',
      subtitle: 'Across all godowns',
      icon: Warehouse,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Current Stock',
      value: '39,581 MT',
      subtitle: '72% utilization',
      icon: Package,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Storage Revenue',
      value: '₹45.2L',
      subtitle: 'This month',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Bills',
      value: '12',
      subtitle: '₹8.5L value',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  // Godown Data
  const godowns = [
    {
      id: 'GD-001',
      name: 'Adilabad',
      location: 'Adilabad District',
      capacity: '15,000 MT',
      current: '13,845 MT',
      utilization: 92.3,
      status: 'critical',
      commodity: 'JOWAR',
      bags: '275,322',
      lastInspection: '2 days ago',
      condition: 'GOOD',
      monthlyBill: '₹17.19L'
    },
    {
      id: 'GD-002',
      name: 'Sangareddy',
      location: 'Sangareddy District',
      capacity: '12,000 MT',
      current: '9,420 MT',
      utilization: 78.5,
      status: 'high',
      commodity: 'PADDY',
      bags: '188,400',
      lastInspection: '1 day ago',
      condition: 'GOOD',
      monthlyBill: '₹12.85L'
    },
    {
      id: 'GD-003',
      name: 'Nizamabad',
      location: 'Nizamabad District',
      capacity: '18,000 MT',
      current: '11,736 MT',
      utilization: 65.2,
      status: 'normal',
      commodity: 'SUNFLOWER',
      bags: '234,720',
      lastInspection: '3 days ago',
      condition: 'GOOD',
      monthlyBill: '₹10.73L'
    },
    {
      id: 'GD-004',
      name: 'Medak',
      location: 'Medak District',
      capacity: '10,000 MT',
      current: '4,580 MT',
      utilization: 45.8,
      status: 'low',
      commodity: 'MAIZE',
      bags: '91,600',
      lastInspection: '1 week ago',
      condition: 'FAIR',
      monthlyBill: '₹5.92L'
    }
  ];

  // Storage Bills Data
  const storageBills = [
    {
      billNo: '2526KNR609005',
      godown: 'Adilabad',
      month: 'May 2025',
      bags: '206,249',
      days: 25,
      grossAmount: '₹11,92,807',
      discount: '₹1,19,281',
      gst: '₹1,93,234',
      netAmount: '₹12,66,760',
      status: 'Paid',
      paidDate: '15/11/2025'
    },
    {
      billNo: '2526KNR609008',
      godown: 'Sangareddy',
      month: 'Jun 2025',
      bags: '275,322',
      days: 30,
      grossAmount: '₹19,10,735',
      discount: '₹1,91,073',
      gst: '₹3,08,319',
      netAmount: '₹20,27,981',
      status: 'Paid',
      paidDate: '15/11/2025'
    },
    {
      billNo: '2526KNR609013',
      godown: 'Adilabad',
      month: 'Jul 2025',
      bags: '275,322',
      days: 31,
      grossAmount: '₹19,10,735',
      discount: '₹1,91,073',
      gst: '₹3,08,319',
      netAmount: '₹20,27,981',
      status: 'Pending',
      paidDate: null
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return { bg: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100' };
      case 'high': return { bg: 'bg-orange-500', text: 'text-orange-700', badge: 'bg-orange-100' };
      case 'normal': return { bg: 'bg-green-500', text: 'text-green-700', badge: 'bg-green-100' };
      case 'low': return { bg: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-100' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-700', badge: 'bg-gray-100' };
    }
  };

  const getBillStatusColor = (status: string) => {
    return status === 'Paid' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Warehouse className="w-7 h-7 text-blue-600" />
            Storage Management
          </h1>
          <p className="text-gray-500 mt-1">Monitor godown utilization, billing, and quality</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">This Month</span>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Generate Bill</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            {[
              { id: 'godowns', label: 'Godown Utilization', count: 4 },
              { id: 'billing', label: 'Storage Billing', count: 12 },
              { id: 'quality', label: 'Quality Monitoring', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 font-semibold text-sm border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Godown Utilization Tab */}
        {activeTab === 'godowns' && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search godowns..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {godowns.map((godown) => {
                const statusColors = getStatusColor(godown.status);
                return (
                  <div
                    key={godown.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <Warehouse className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{godown.name}</h3>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {godown.location}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors.badge} ${statusColors.text}`}>
                        {godown.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Storage Utilization</span>
                        <span className="text-lg font-bold text-gray-900">{godown.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`${statusColors.bg} h-3 rounded-full transition-all`}
                          style={{ width: `${godown.utilization}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                        <span>{godown.current}</span>
                        <span>{godown.capacity}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Commodity</div>
                        <div className="text-sm font-semibold text-gray-900">{godown.commodity}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Total Bags</div>
                        <div className="text-sm font-semibold text-gray-900">{godown.bags}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Last Inspection</div>
                        <div className="text-sm font-semibold text-gray-900">{godown.lastInspection}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Condition</div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">{godown.condition}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <div className="text-xs text-gray-500">Monthly Bill</div>
                        <div className="text-xl font-bold text-gray-900">{godown.monthlyBill}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                          <BarChart3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Storage Billing Tab */}
        {activeTab === 'billing' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Storage Bills</h3>
              <p className="text-sm text-gray-600">Rate: ₹6.94 per bag per month | 10% automatic discount | 18% GST (CGST 9% + SGST 9%)</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bill No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Godown</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bags/Days</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Gross</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Discount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">GST</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Net Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {storageBills.map((bill, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-900">{bill.billNo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{bill.godown}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{bill.month}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{bill.bags} bags</div>
                        <div className="text-xs text-gray-500">{bill.days} days</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{bill.grossAmount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-green-600">-{bill.discount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">+{bill.gst}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{bill.netAmount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getBillStatusColor(bill.status)}`}>
                            {bill.status}
                          </span>
                          {bill.paidDate && (
                            <span className="text-xs text-gray-500">{bill.paidDate}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageDashboard;