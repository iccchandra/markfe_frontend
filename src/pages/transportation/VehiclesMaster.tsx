// ============================================
// pages/transportation/VehiclesMaster.tsx
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Plus, Search, Filter, Download, Eye, Edit, Trash2,
  CheckCircle, AlertCircle, Calendar, MapPin, User, Phone
} from 'lucide-react';

export const VehiclesMaster: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Vehicle Data
  const vehicles = [
    {
      id: 'VEH-001',
      vehicleNo: 'AP16TY-0677',
      type: 'Truck',
      capacity: '10 Tons',
      owner: 'M/s New Lorry Owners Association',
      driverName: 'Rajesh Kumar',
      driverPhone: '+91 98765 43210',
      registrationDate: '15-Jan-2020',
      insuranceExpiry: '14-Jan-2026',
      fitnessExpiry: '14-Jan-2026',
      status: 'Active',
      lastTrip: '2 days ago',
      totalTrips: 145,
      avgRating: 4.8
    },
    {
      id: 'VEH-002',
      vehicleNo: 'TS12UA-8171',
      type: 'Mini Truck',
      capacity: '7.5 Tons',
      owner: 'M/s Transport Services Ltd',
      driverName: 'Srinivas Reddy',
      driverPhone: '+91 98765 43211',
      registrationDate: '20-Mar-2021',
      insuranceExpiry: '19-Mar-2026',
      fitnessExpiry: '19-Mar-2026',
      status: 'Active',
      lastTrip: '5 hours ago',
      totalTrips: 98,
      avgRating: 4.6
    },
    {
      id: 'VEH-003',
      vehicleNo: 'AP29TR-3336',
      type: 'Heavy Truck',
      capacity: '15 Tons',
      owner: 'M/s Highway Transport Co',
      driverName: 'Venkat Rao',
      driverPhone: '+91 98765 43212',
      registrationDate: '10-Aug-2019',
      insuranceExpiry: '09-Aug-2025',
      fitnessExpiry: '09-Aug-2025',
      status: 'Maintenance',
      lastTrip: '1 week ago',
      totalTrips: 203,
      avgRating: 4.9
    },
    {
      id: 'VEH-004',
      vehicleNo: 'TS12UC-7370',
      type: 'Truck',
      capacity: '10 Tons',
      owner: 'M/s Reliable Logistics',
      driverName: 'Krishna Prasad',
      driverPhone: '+91 98765 43213',
      registrationDate: '05-Jun-2022',
      insuranceExpiry: '04-Jun-2026',
      fitnessExpiry: '04-Jun-2026',
      status: 'Active',
      lastTrip: '1 day ago',
      totalTrips: 67,
      avgRating: 4.7
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
      case 'Maintenance': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vehicle.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-blue-600" />
            Vehicle Master
          </h1>
          <p className="text-gray-500 mt-1">Manage all vehicles and their details</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
          <button 
            onClick={() => navigate('/transportation/vehicles/add')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Vehicle</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Vehicles</span>
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">156</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Active</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">142</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">In Maintenance</span>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">14</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Rating</span>
            <span className="text-yellow-500">★</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">4.7</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle number, driver, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <button className="px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters</span>
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{vehicle.vehicleNo}</h3>
                  <p className="text-sm text-gray-500">{vehicle.type} • {vehicle.capacity}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(vehicle.status)}`}>
                {vehicle.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Owner</div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 line-clamp-1">{vehicle.owner}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Driver</div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{vehicle.driverName}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Phone</div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{vehicle.driverPhone}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Total Trips</div>
                <span className="text-sm font-bold text-blue-600">{vehicle.totalTrips}</span>
              </div>
            </div>

            {/* Expiry Dates */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="text-xs text-gray-500 mb-1">Insurance Expiry</div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-900">{vehicle.insuranceExpiry}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Fitness Expiry</div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className="text-xs font-medium text-gray-900">{vehicle.fitnessExpiry}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold text-gray-900">{vehicle.avgRating}</span>
                </div>
                <span>Last trip: {vehicle.lastTrip}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate(`/transportation/vehicles/${vehicle.id}`)}
                  className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => navigate(`/transportation/vehicles/edit/${vehicle.id}`)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                  title="Edit Vehicle"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this vehicle?')) {
                      console.log('Delete vehicle:', vehicle.id);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                  title="Delete Vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehiclesMaster;