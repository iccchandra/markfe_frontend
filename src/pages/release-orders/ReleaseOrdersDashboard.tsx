// ============================================
// pages/release-orders/ReleaseOrdersDashboard.tsx
// ============================================
import React, { useState } from 'react';
import {
  FileText, DollarSign, TrendingUp, AlertCircle, Plus, Search,
  Filter, Download, Eye, Edit, CheckCircle, Clock, Calendar,
  User, Package, MapPin, CreditCard, Truck, Scale
} from 'lucide-react';

export const ReleaseOrdersDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');

  // Stats Cards
  const stats = [
    {
      title: 'Active ROs',
      value: '24',
      subtitle: '₹125.4L total value',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pending Payment',
      value: '15',
      subtitle: '₹48.2L outstanding',
      icon: DollarSign,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Completed (MTD)',
      value: '89',
      subtitle: '98% collection rate',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Avg Lifting Time',
      value: '4.2 days',
      subtitle: 'Target: <5 days',
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // Release Orders Data
  const releaseOrders = [
    {
      roNo: 'RO/2025/001',
      buyer: 'M/s Santhoshi Parvathi Enterprises',
      commodity: 'Sunflower',
      quantity: '64.38 MT',
      rate: '₹51,901/MT',
      roValue: '₹33,41,386',
      gst: '₹1,67,069',
      totalValue: '₹35,08,455',
      advanceReceived: '₹29,79,187',
      balanceDue: '₹5,25,760',
      godown: 'CWC DUBBA, Nizamabad',
      roDate: '17-12-2025',
      validTill: '17-01-2026',
      status: 'In Progress',
      liftingStatus: 'Partial',
      liftedQty: '35.20 MT',
      paymentStatus: '85% Paid'
    },
    {
      roNo: 'RO/2025/002',
      buyer: 'M/s Telangana Grains Ltd',
      commodity: 'JOWAR',
      quantity: '100.00 MT',
      rate: '₹48,500/MT',
      roValue: '₹48,50,000',
      gst: '₹2,42,500',
      totalValue: '₹50,92,500',
      advanceReceived: '₹43,28,625',
      balanceDue: '₹7,63,875',
      godown: 'TGSWC NACHUPALLY, Adilabad',
      roDate: '20-12-2025',
      validTill: '20-01-2026',
      status: 'Pending',
      liftingStatus: 'Not Started',
      liftedQty: '0 MT',
      paymentStatus: '85% Paid'
    },
    {
      roNo: 'RO/2025/003',
      buyer: 'M/s Krishna Trading Company',
      commodity: 'Paddy',
      quantity: '75.50 MT',
      rate: '₹45,200/MT',
      roValue: '₹34,13,100',
      gst: '₹1,70,655',
      totalValue: '₹35,83,755',
      advanceReceived: '₹35,83,755',
      balanceDue: '₹0',
      godown: 'PACS Sangareddy',
      roDate: '15-12-2025',
      validTill: '15-01-2026',
      status: 'Completed',
      liftingStatus: 'Completed',
      liftedQty: '75.50 MT',
      paymentStatus: '100% Paid'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLiftingStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Partial': return 'bg-orange-100 text-orange-700';
      case 'Not Started': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            Release Order Management
          </h1>
          <p className="text-gray-500 mt-1">Manage commodity disposal and buyer transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Create RO</span>
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
              { id: 'active', label: 'Active ROs', count: 24 },
              { id: 'pending', label: 'Pending Payment', count: 15 },
              { id: 'completed', label: 'Completed', count: 89 }
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
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* RO List */}
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by RO number, buyer..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>

          <div className="space-y-4">
            {releaseOrders.map((ro) => (
              <div
                key={ro.roNo}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{ro.roNo}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(ro.status)}`}>
                        {ro.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getLiftingStatusColor(ro.liftingStatus)}`}>
                        {ro.liftingStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{ro.buyer}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{ro.totalValue}</div>
                    <div className="text-sm text-gray-500">Total Value (incl. GST)</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Commodity</div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{ro.commodity}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Quantity</div>
                    <div className="flex items-center gap-1">
                      <Scale className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{ro.quantity}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Rate</div>
                    <div className="text-sm font-semibold text-gray-900">{ro.rate}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Godown</div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{ro.godown}</span>
                    </div>
                  </div>
                </div>

                {/* Payment & Lifting Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  {/* Payment Details */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Payment Status</h4>
                      <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {ro.paymentStatus}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">RO Value:</span>
                        <span className="font-semibold text-gray-900">{ro.roValue}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">GST @ 5%:</span>
                        <span className="font-semibold text-gray-900">{ro.gst}</span>
                      </div>
                      <div className="flex justify-between text-sm border-t border-gray-300 pt-2">
                        <span className="text-gray-600">Advance (85%):</span>
                        <span className="font-bold text-green-600">{ro.advanceReceived}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Balance Due:</span>
                        <span className="font-bold text-orange-600">{ro.balanceDue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lifting Details */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck className="w-4 h-4 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Lifting Status</h4>
                      <span className={`ml-auto px-2 py-0.5 text-xs font-semibold rounded-full ${getLiftingStatusColor(ro.liftingStatus)}`}>
                        {ro.liftingStatus}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Qty:</span>
                        <span className="font-semibold text-gray-900">{ro.quantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Lifted:</span>
                        <span className="font-semibold text-green-600">{ro.liftedQty}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${(parseFloat(ro.liftedQty) / parseFloat(ro.quantity)) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">RO Date:</span>
                        <span className="font-medium text-gray-900">{ro.roDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Valid Till:</span>
                        <span className="font-medium text-gray-900">{ro.validTill}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {ro.roDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View Details</span>
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseOrdersDashboard;