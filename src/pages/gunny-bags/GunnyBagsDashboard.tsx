// ============================================
// pages/gunny-bags/GunnyBagsDashboard.tsx
// ============================================
import React, { useState } from 'react';
import {
  Package, TrendingUp, AlertTriangle, DollarSign, Plus, Search,
  Filter, Download, Eye, Edit, Users, ShoppingCart, CheckCircle,
  Box, BarChart3, Truck, Calendar
} from 'lucide-react';

export const GunnyBagsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'procurement' | 'vendors'>('inventory');

  // Stats Cards
  const stats = [
    {
      title: 'Total Stock',
      value: '45,280',
      subtitle: 'All bag types',
      icon: Package,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Low Stock Items',
      value: '3',
      subtitle: 'Below reorder level',
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Active Vendors',
      value: '12',
      subtitle: 'Empaneled suppliers',
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Procurement (MTD)',
      value: '₹8.5L',
      subtitle: '15% cost savings',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // Inventory Data
  const inventoryData = [
    {
      id: 'BAG-001',
      type: 'Jute Bags',
      specification: '50 KG, 400 GSM',
      currentStock: 15250,
      minLevel: 10000,
      reorderLevel: 15000,
      maxLevel: 25000,
      status: 'normal',
      avgRate: '₹45/bag',
      monthlyUsage: 2500,
      variance: '+0.8%',
      lastProcurement: '15 days ago',
      quality: 'Grade A'
    },
    {
      id: 'BAG-002',
      type: 'HDPE Bags',
      specification: '50 KG, White',
      currentStock: 8500,
      minLevel: 10000,
      reorderLevel: 15000,
      maxLevel: 20000,
      status: 'low',
      avgRate: '₹32/bag',
      monthlyUsage: 1800,
      variance: '+1.2%',
      lastProcurement: '8 days ago',
      quality: 'Grade A'
    },
    {
      id: 'BAG-003',
      type: 'PP Bags',
      specification: '25 KG, Woven',
      currentStock: 12800,
      minLevel: 8000,
      reorderLevel: 12000,
      maxLevel: 18000,
      status: 'normal',
      avgRate: '₹28/bag',
      monthlyUsage: 1200,
      variance: '-0.5%',
      lastProcurement: '20 days ago',
      quality: 'Grade A'
    },
    {
      id: 'BAG-004',
      type: 'Cotton Bags',
      specification: '100 KG, Natural',
      currentStock: 3200,
      minLevel: 5000,
      reorderLevel: 8000,
      maxLevel: 12000,
      status: 'critical',
      avgRate: '₹85/bag',
      monthlyUsage: 600,
      variance: '+2.1%',
      lastProcurement: '25 days ago',
      quality: 'Grade B'
    }
  ];

  // Procurement Orders Data
  const procurementOrders = [
    {
      poNo: 'PO/2025/GB/001',
      vendor: 'M/s Jute Products Ltd',
      bagType: 'Jute Bags - 50 KG',
      quantity: 10000,
      rate: '₹45/bag',
      totalValue: '₹4,50,000',
      gst: '₹81,000',
      netAmount: '₹5,31,000',
      orderDate: '02-01-2026',
      expectedDelivery: '15-01-2026',
      status: 'In Transit',
      deliveredQty: 0,
      qualityStatus: 'Pending'
    },
    {
      poNo: 'PO/2025/GB/002',
      vendor: 'M/s Polymer Bags Inc',
      bagType: 'HDPE Bags - 50 KG',
      quantity: 5000,
      rate: '₹32/bag',
      totalValue: '₹1,60,000',
      gst: '₹28,800',
      netAmount: '₹1,88,800',
      orderDate: '28-12-2025',
      expectedDelivery: '10-01-2026',
      status: 'Delivered',
      deliveredQty: 5000,
      qualityStatus: 'Passed'
    }
  ];

  // Vendor Data
  const vendors = [
    {
      id: 'V-001',
      name: 'M/s Jute Products Ltd',
      contactPerson: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      rating: 4.8,
      totalOrders: 45,
      totalValue: '₹42.5L',
      onTimeDelivery: '96%',
      qualityScore: '98%',
      status: 'Active',
      specialization: 'Jute Bags'
    },
    {
      id: 'V-002',
      name: 'M/s Polymer Bags Inc',
      contactPerson: 'Srinivas Reddy',
      phone: '+91 98765 43211',
      rating: 4.5,
      totalOrders: 38,
      totalValue: '₹28.2L',
      onTimeDelivery: '92%',
      qualityScore: '95%',
      status: 'Active',
      specialization: 'HDPE/PP Bags'
    },
    {
      id: 'V-003',
      name: 'M/s Cotton Bags Co',
      contactPerson: 'Venkat Rao',
      phone: '+91 98765 43212',
      rating: 4.2,
      totalOrders: 22,
      totalValue: '₹15.8L',
      onTimeDelivery: '88%',
      qualityScore: '90%',
      status: 'Active',
      specialization: 'Cotton Bags'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return { bg: 'bg-red-500', badge: 'bg-red-100 text-red-700' };
      case 'low': return { bg: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' };
      case 'normal': return { bg: 'bg-green-500', badge: 'bg-green-100 text-green-700' };
      case 'high': return { bg: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' };
      default: return { bg: 'bg-gray-500', badge: 'bg-gray-100 text-gray-700' };
    }
  };

  const getPOStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-blue-600" />
            Gunny Bags Management
          </h1>
          <p className="text-gray-500 mt-1">Track inventory, procurement, and vendor performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Create PO</span>
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
              { id: 'inventory', label: 'Inventory Status', icon: Box },
              { id: 'procurement', label: 'Procurement Orders', icon: ShoppingCart },
              { id: 'vendors', label: 'Vendors', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bag types..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {inventoryData.map((item) => {
                const statusColors = getStatusColor(item.status);
                const utilizationPct = (item.currentStock / item.maxLevel) * 100;
                
                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{item.type}</h3>
                          <p className="text-sm text-gray-500">{item.specification}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors.badge}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Current Stock</div>
                        <div className="text-2xl font-bold text-gray-900">{item.currentStock.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Reorder Level</div>
                        <div className="text-lg font-semibold text-gray-900">{item.reorderLevel.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Monthly Usage</div>
                        <div className="text-lg font-semibold text-gray-900">{item.monthlyUsage.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Avg Rate</div>
                        <div className="text-lg font-semibold text-blue-600">{item.avgRate}</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2 text-sm">
                        <span className="text-gray-600">Stock Level</span>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Min: {item.minLevel.toLocaleString()}</span>
                          <span>Max: {item.maxLevel.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`${statusColors.bg} h-3 rounded-full transition-all`}
                          style={{ width: `${utilizationPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Quality: {item.quality}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>Variance: {item.variance}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Last Proc: {item.lastProcurement}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Procurement Tab */}
        {activeTab === 'procurement' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">PO Number</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Bag Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Net Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Expected</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {procurementOrders.map((po) => (
                    <tr key={po.poNo} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-900">{po.poNo}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{po.vendor}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{po.bagType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{po.quantity.toLocaleString()}</div>
                          {po.deliveredQty > 0 && (
                            <div className="text-xs text-green-600">Delivered: {po.deliveredQty.toLocaleString()}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{po.netAmount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{po.expectedDelivery}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPOStatusColor(po.status)}`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {vendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{vendor.name}</h3>
                      <p className="text-sm text-gray-500">{vendor.specialization}</p>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm font-bold text-gray-900">{vendor.rating}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Contact Person</div>
                      <div className="text-sm font-semibold text-gray-900">{vendor.contactPerson}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Phone</div>
                      <div className="text-sm font-semibold text-gray-900">{vendor.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Orders</div>
                      <div className="text-sm font-semibold text-gray-900">{vendor.totalOrders}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Total Value</div>
                      <div className="text-sm font-semibold text-blue-600">{vendor.totalValue}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">On-Time Delivery</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: vendor.onTimeDelivery }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{vendor.onTimeDelivery}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Quality Score</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: vendor.qualityScore }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{vendor.qualityScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      {vendor.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GunnyBagsDashboard;