import React, { useState, useEffect } from 'react';
import {
  Download, Calendar, DollarSign, TrendingUp, Building2,
  FileText, BarChart3, PieChart, Users, Filter, RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { Badge } from '../../components/common/Badge/Badge';
import { apiService } from '../../services/api.service';

interface ReportData {
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    completed: number;
  };
  revenue: {
    total: number;
    currentMonth: number;
    lastMonth: number;
    growth: number;
  };
  venues: {
    totalVenues: number;
    activeVenues: number;
    topPerforming: Array<{
      name: string;
      bookings: number;
      revenue: number;
    }>;
  };
  users: {
    totalUsers: number;
    activeUsers: number;
    newThisMonth: number;
  };
  monthlyData: Array<{
    month: string;
    bookings: number;
    revenue: number;
  }>;
}

export const ReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [selectedReportType, setSelectedReportType] = useState<'overview' | 'bookings' | 'revenue' | 'venues'>('overview');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockData: ReportData = {
        bookings: {
          total: 1248,
          confirmed: 856,
          pending: 142,
          cancelled: 178,
          completed: 72
        },
        revenue: {
          total: 45200000,
          currentMonth: 8500000,
          lastMonth: 7200000,
          growth: 18.1
        },
        venues: {
          totalVenues: 12,
          activeVenues: 10,
          topPerforming: [
            { name: 'Peoples Plaza', bookings: 156, revenue: 22108800 },
            { name: 'Necklace Road', bookings: 134, revenue: 13400000 },
            { name: 'Lumbini Park', bookings: 98, revenue: 20580000 },
            { name: 'Sanjeevaiah Park', bookings: 89, revenue: 15575000 }
          ]
        },
        users: {
          totalUsers: 2456,
          activeUsers: 1832,
          newThisMonth: 124
        },
        monthlyData: [
          { month: 'Jan', bookings: 95, revenue: 3200000 },
          { month: 'Feb', bookings: 102, revenue: 3500000 },
          { month: 'Mar', bookings: 118, revenue: 4100000 },
          { month: 'Apr', bookings: 125, revenue: 4300000 },
          { month: 'May', bookings: 132, revenue: 4800000 },
          { month: 'Jun', bookings: 145, revenue: 5200000 },
          { month: 'Jul', bookings: 156, revenue: 5800000 },
          { month: 'Aug', bookings: 168, revenue: 6200000 },
          { month: 'Sep', bookings: 142, revenue: 5500000 },
          { month: 'Oct', bookings: 135, revenue: 5100000 },
          { month: 'Nov', bookings: 148, revenue: 5600000 },
          { month: 'Dec', bookings: 162, revenue: 6400000 }
        ]
      };
      setReportData(mockData);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    // Implement export functionality
    console.log(`Exporting as ${format}`);
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading reports..." />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No report data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            View comprehensive reports and analytics data
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => fetchReportData()}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export PDF
          </Button>
          <Button
            onClick={() => handleExport('excel')}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-gray-600">to</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2 ml-auto">
            {['overview', 'bookings', 'revenue', 'venues'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedReportType(type as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedReportType === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <Badge variant="success">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12.5%
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Bookings</h3>
          <p className="text-3xl font-bold text-gray-900">{reportData.bookings.total.toLocaleString()}</p>
          <div className="mt-4 flex gap-3 text-xs">
            <div>
              <span className="text-gray-500">Confirmed:</span>
              <span className="font-semibold text-gray-900 ml-1">{reportData.bookings.confirmed}</span>
            </div>
            <div>
              <span className="text-gray-500">Pending:</span>
              <span className="font-semibold text-gray-900 ml-1">{reportData.bookings.pending}</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <Badge variant="success">
              <TrendingUp className="w-3 h-3 mr-1" />
              +{reportData.revenue.growth.toFixed(1)}%
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">
            ₹{(reportData.revenue.total / 10000000).toFixed(1)}Cr
          </p>
          <div className="mt-4 text-xs">
            <span className="text-gray-600">This Month:</span>
            <span className="font-semibold text-gray-900 ml-1">
              ₹{(reportData.revenue.currentMonth / 100000).toFixed(1)}L
            </span>
          </div>
        </div>

        {/* Active Venues */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <Badge variant="default">
              {reportData.venues.activeVenues} / {reportData.venues.totalVenues}
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Active Venues</h3>
          <p className="text-3xl font-bold text-gray-900">{reportData.venues.activeVenues}</p>
          <div className="mt-4 text-xs text-gray-600">
            Out of {reportData.venues.totalVenues} total venues
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <Badge variant="warning">
              +{reportData.users.newThisMonth} new
            </Badge>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Active Users</h3>
          <p className="text-3xl font-bold text-gray-900">{reportData.users.activeUsers.toLocaleString()}</p>
          <div className="mt-4 text-xs text-gray-600">
            Total: {reportData.users.totalUsers.toLocaleString()} users
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bookings Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Monthly Bookings Trend
            </h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {reportData.monthlyData.slice(-6).map((data, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 text-sm font-semibold text-gray-600">{data.month}</div>
                <div className="flex-1">
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-end pr-3"
                      style={{ width: `${(data.bookings / 200) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">{data.bookings}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Monthly Revenue Trend
            </h3>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            {reportData.monthlyData.slice(-6).map((data, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 text-sm font-semibold text-gray-600">{data.month}</div>
                <div className="flex-1">
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-end pr-3"
                      style={{ width: `${(data.revenue / 7000000) * 100}%` }}
                    >
                      <span className="text-xs font-bold text-white">
                        ₹{(data.revenue / 100000).toFixed(1)}L
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Venues */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            Top Performing Venues
          </h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportData.venues.topPerforming.map((venue, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-600">#{index + 1}</span>
                </div>
                <Badge variant="success">
                  {venue.bookings} bookings
                </Badge>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{venue.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue:</span>
                  <span className="font-bold text-green-600">
                    ₹{(venue.revenue / 100000).toFixed(1)}L
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg/Booking:</span>
                  <span className="font-semibold text-gray-900">
                    ₹{(venue.revenue / venue.bookings / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Status Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          Booking Status Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: reportData.bookings.total, color: 'bg-gray-900', percentage: 100 },
            { label: 'Confirmed', value: reportData.bookings.confirmed, color: 'bg-green-500', percentage: (reportData.bookings.confirmed / reportData.bookings.total) * 100 },
            { label: 'Pending', value: reportData.bookings.pending, color: 'bg-yellow-500', percentage: (reportData.bookings.pending / reportData.bookings.total) * 100 },
            { label: 'Cancelled', value: reportData.bookings.cancelled, color: 'bg-red-500', percentage: (reportData.bookings.cancelled / reportData.bookings.total) * 100 },
            { label: 'Completed', value: reportData.bookings.completed, color: 'bg-blue-500', percentage: (reportData.bookings.completed / reportData.bookings.total) * 100 }
          ].map((stat, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`w-16 h-16 ${stat.color} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                <span className="text-white text-xl font-bold">{stat.value}</span>
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">{stat.label}</div>
              <div className="text-xs text-gray-600">{stat.percentage.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-lg border border-primary-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          Report Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Highlights</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Revenue grew by {reportData.revenue.growth.toFixed(1)}% this month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{reportData.bookings.confirmed} confirmed bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{reportData.venues.activeVenues} venues actively operational</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Action Items</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>{reportData.bookings.pending} bookings pending approval</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>Follow up on {reportData.bookings.cancelled} cancelled bookings</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>Review inactive venues for optimization</span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-600 mb-2">Top Performer</h4>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <div className="font-bold text-gray-900 mb-1">
                {reportData.venues.topPerforming[0].name}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>{reportData.venues.topPerforming[0].bookings} bookings</div>
                <div className="font-semibold text-green-600">
                  ₹{(reportData.venues.topPerforming[0].revenue / 100000).toFixed(1)}L revenue
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;