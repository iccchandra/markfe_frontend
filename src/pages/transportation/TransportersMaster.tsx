// ============================================
// pages/transportation/TransportersMaster.tsx
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Plus, Search, Filter, Download, Eye, Edit,
  Phone, Mail, MapPin, Truck, TrendingUp, DollarSign, Star
} from 'lucide-react';

export const TransportersMaster: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Transporter Data
  const transporters = [
    {
      id: 'TRANS-001',
      name: 'M/s New Lorry Owners Association',
      contactPerson: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'contact@newlorryowners.com',
      address: 'Sangareddy District, Telangana',
      panNo: 'ABCDE1234F',
      gstNo: '36ABCDE1234F1Z5',
      bankName: 'State Bank of India',
      accountNo: '1234567890',
      ifscCode: 'SBIN0001234',
      totalVehicles: 45,
      activeVehicles: 42,
      totalTrips: 1250,
      revenue: '₹42.5L',
      rating: 4.8,
      status: 'Active',
      joinedDate: '15-Jan-2020'
    },
    {
      id: 'TRANS-002',
      name: 'M/s Transport Services Ltd',
      contactPerson: 'Srinivas Reddy',
      phone: '+91 98765 43211',
      email: 'info@transportservices.com',
      address: 'Medak District, Telangana',
      panNo: 'FGHIJ5678K',
      gstNo: '36FGHIJ5678K1Z5',
      bankName: 'HDFC Bank',
      accountNo: '0987654321',
      ifscCode: 'HDFC0001234',
      totalVehicles: 38,
      activeVehicles: 35,
      totalTrips: 980,
      revenue: '₹35.2L',
      rating: 4.6,
      status: 'Active',
      joinedDate: '20-Mar-2021'
    },
    {
      id: 'TRANS-003',
      name: 'M/s Highway Transport Co',
      contactPerson: 'Venkat Rao',
      phone: '+91 98765 43212',
      email: 'venkat@highwaytransport.com',
      address: 'Adilabad District, Telangana',
      panNo: 'KLMNO9012P',
      gstNo: '36KLMNO9012P1Z5',
      bankName: 'ICICI Bank',
      accountNo: '5555666677',
      ifscCode: 'ICIC0001234',
      totalVehicles: 52,
      activeVehicles: 48,
      totalTrips: 1450,
      revenue: '₹58.8L',
      rating: 4.9,
      status: 'Active',
      joinedDate: '10-Aug-2019'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
      case 'Suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTransporters = transporters.filter(transporter =>
    transporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transporter.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transporter.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Transporter Master
          </h1>
          <p className="text-gray-500 mt-1">Manage transporter companies and associations</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
          <button 
            onClick={() => navigate('/transportation/transporters/add')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Transporter</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Transporters</span>
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">42</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Vehicles</span>
            <Truck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">1,250</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Revenue</span>
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">₹4.2Cr</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Rating</span>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">4.8</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, contact person, or location..."
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

      {/* Transporters List */}
      <div className="space-y-4">
        {filteredTransporters.map((transporter) => (
          <div
            key={transporter.id}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{transporter.name}</h3>
                  <p className="text-sm text-gray-500">Member since: {transporter.joinedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 rounded-lg">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-bold text-gray-900">{transporter.rating}</span>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(transporter.status)}`}>
                  {transporter.status}
                </span>
              </div>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">CONTACT PERSON</div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{transporter.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{transporter.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{transporter.address}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">TAX DETAILS</div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">PAN:</span>
                    <span className="text-sm font-mono text-gray-900">{transporter.panNo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">GST:</span>
                    <span className="text-sm font-mono text-gray-900">{transporter.gstNo}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-2 font-medium">BANK DETAILS</div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Bank:</span>
                    <span className="text-sm text-gray-900">{transporter.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">A/c:</span>
                    <span className="text-sm font-mono text-gray-900">{transporter.accountNo}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">IFSC:</span>
                    <span className="text-sm font-mono text-gray-900">{transporter.ifscCode}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">Total Vehicles</div>
                <div className="text-2xl font-bold text-gray-900">{transporter.totalVehicles}</div>
                <div className="text-xs text-green-600 mt-0.5">{transporter.activeVehicles} active</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">Total Trips</div>
                <div className="text-2xl font-bold text-gray-900">{transporter.totalTrips}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-purple-600">{transporter.revenue}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">Performance</div>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-xl font-bold text-green-600">+18%</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={() => navigate(`/transportation/transporters/${transporter.id}`)}
                className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">View Details</span>
              </button>
              <button 
                onClick={() => navigate(`/transportation/transporters/edit/${transporter.id}`)}
                className="px-4 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button 
                onClick={() => navigate(`/transportation/payments?transporter=${transporter.id}`)}
                className="px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Payment History</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportersMaster;