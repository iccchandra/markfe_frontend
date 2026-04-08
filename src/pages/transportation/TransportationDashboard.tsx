// ============================================
// pages/transportation/TransportationDashboard.tsx
// ============================================
import React, { useState } from 'react';
import {
  Truck, TrendingUp, DollarSign, AlertCircle, Plus, Search,
  Filter, Download, Eye, Edit, MapPin, Calendar, ArrowUpRight,
  CheckCircle, Clock, Package, Navigation, BarChart3
} from 'lucide-react';

export const TransportationDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trips' | 'vehicles' | 'billing'>('trips');

  // Stats Cards
  const stats = [
    {
      title: 'Active Trips',
      value: '24',
      change: '+15%',
      trend: 'up',
      icon: Truck,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Vehicles',
      value: '156',
      change: '+8',
      trend: 'up',
      icon: Package,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Revenue (MTD)',
      value: '₹12.5L',
      change: '+22%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg. Distance',
      value: '42.3 KM',
      change: '-5%',
      trend: 'down',
      icon: Navigation,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  // Active Trips Data
  const activeTrips = [
    {
      id: 'TRP-001',
      vehicle: 'AP16TY-0677',
      driver: 'Rajesh Kumar',
      from: 'PACS Khaderabad',
      to: 'DCMS Sadashivpet',
      quantity: '650 bags (27.5 MT)',
      distance: '55.4 KM',
      slab: 'Slab 4 (40-80 KM)',
      status: 'In Transit',
      progress: 65,
      estimatedArrival: '2:30 PM',
      billAmount: '₹16,514'
    },
    {
      id: 'TRP-002',
      vehicle: 'TS12UA-8171',
      driver: 'Srinivas Reddy',
      from: 'PACS Kondapur',
      to: 'DCMS Sadashivpet',
      quantity: '540 bags (27 MT)',
      distance: '20.5 KM',
      slab: 'Slab 3 (20-40 KM)',
      status: 'Loading',
      progress: 15,
      estimatedArrival: '4:00 PM',
      billAmount: '₹11,282'
    },
    {
      id: 'TRP-003',
      vehicle: 'AP29TR-3336',
      driver: 'Venkat Rao',
      from: 'PACS Khaderabad',
      to: 'DCMS Sadashivpet',
      quantity: '598 bags (29.9 MT)',
      distance: '55.4 KM',
      slab: 'Slab 4 (40-80 KM)',
      status: 'Completed',
      progress: 100,
      estimatedArrival: 'Arrived',
      billAmount: '₹17,048'
    }
  ];

  // Distance Slabs
  const distanceSlabs = [
    { slab: 'Slab 1', range: '0-8 KM', rate: '₹25.50/bag', trips: 45, revenue: '₹2.85L' },
    { slab: 'Slab 2', range: '8-20 KM', rate: '₹14.55/bag', trips: 128, revenue: '₹8.92L' },
    { slab: 'Slab 3', range: '20-40 KM', rate: '₹3.93/bag', trips: 89, revenue: '₹3.45L' },
    { slab: 'Slab 4', range: '40-80 KM', rate: '₹3.06/bag', trips: 67, revenue: '₹4.28L' },
    { slab: 'Slab 5', range: '80+ KM', rate: '₹2.85/bag', trips: 23, revenue: '₹1.92L' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-100 text-blue-700';
      case 'Loading': return 'bg-yellow-100 text-yellow-700';
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'Scheduled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-blue-600" />
            Transportation Management
          </h1>
          <p className="text-gray-500 mt-1">Monitor and manage all transportation operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Trip</span>
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
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <ArrowUpRight className="w-3.5 h-3.5" />
                {stat.change}
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-6">
            {[
              { id: 'trips', label: 'Active Trips', count: 24 },
              { id: 'vehicles', label: 'Vehicles', count: 156 },
              { id: 'billing', label: 'Billing & Slabs', count: null }
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

        {/* Active Trips Tab */}
        {activeTab === 'trips' && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search trips by vehicle, route..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>

            <div className="space-y-4">
              {activeTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-xl">
                        <Truck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{trip.vehicle}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(trip.status)}`}>
                            {trip.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Trip ID: {trip.id} • Driver: {trip.driver}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{trip.billAmount}</div>
                      <div className="text-xs text-gray-500 mt-1">{trip.slab}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">From</div>
                        <div className="text-sm font-semibold text-gray-900">{trip.from}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">To</div>
                        <div className="text-sm font-semibold text-gray-900">{trip.to}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Quantity</div>
                        <div className="text-sm font-semibold text-gray-900">{trip.quantity}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{trip.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${trip.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        {trip.distance}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        ETA: {trip.estimatedArrival}
                      </div>
                    </div>
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

        {/* Billing & Slabs Tab */}
        {activeTab === 'billing' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Distance-Based Slab Pricing</h3>
              <p className="text-sm text-gray-600">Current rate structure and performance by slab</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Slab</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Distance Range</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rate per Bag</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total Trips</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {distanceSlabs.map((slab, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{slab.slab}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{slab.range}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-blue-600">{slab.rate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{slab.trips}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{slab.revenue}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
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

export default TransportationDashboard;