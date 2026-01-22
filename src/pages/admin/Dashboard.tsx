import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Calendar, DollarSign, Users, Building2,
  ArrowUp, ArrowDown, Eye, CheckCircle, Clock, XCircle,
  MapPin, Activity, AlertCircle, BarChart3
} from 'lucide-react';
import { Button } from '../../components/common/Button/Button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from '../../components/common/Table/Table';
import { Badge } from '../../components/common/Badge/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api.service';

interface DashboardStats {
  totalBookings: number;
  bookingsChange: number;
  totalRevenue: number;
  revenueChange: number;
  activeUsers: number;
  usersChange: number;
  activeVenues: number;
  venuesChange: number;
}

interface RecentBooking {
  _id: string;
  bookingNumber: string;
  venue: string;
  applicantName: string;
  date: string;
  amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface VenuePerformance {
  name: string;
  bookings: number;
  revenue: number;
  percentage: number;
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: Date;
  type: 'booking' | 'payment' | 'user' | 'venue';
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 1248,
    bookingsChange: 12.5,
    totalRevenue: 4520000,
    revenueChange: 8.3,
    activeUsers: 856,
    usersChange: 5.2,
    activeVenues: 12,
    venuesChange: 0
  });

  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([
    {
      _id: '1',
      bookingNumber: 'BPP20250115001',
      venue: 'Peoples Plaza',
      applicantName: 'John Doe',
      date: '2025-01-20',
      amount: 429000,
      status: 'confirmed'
    },
    {
      _id: '2',
      bookingNumber: 'BPP20250115002',
      venue: 'Lumbini Park',
      applicantName: 'Jane Smith',
      date: '2025-01-22',
      amount: 22880,
      status: 'pending'
    },
    {
      _id: '3',
      bookingNumber: 'BPP20250115003',
      venue: 'Necklace Road',
      applicantName: 'Mike Johnson',
      date: '2025-01-25',
      amount: 14300,
      status: 'confirmed'
    },
    {
      _id: '4',
      bookingNumber: 'BPP20250114004',
      venue: 'Sanjeevaiah Park',
      applicantName: 'Sarah Williams',
      date: '2025-01-18',
      amount: 25025,
      status: 'cancelled'
    },
    {
      _id: '5',
      bookingNumber: 'BPP20250113005',
      venue: 'Peoples Plaza',
      applicantName: 'Robert Brown',
      date: '2025-02-01',
      amount: 457600,
      status: 'pending'
    }
  ]);

  const [venuePerformance, setVenuePerformance] = useState<VenuePerformance[]>([
    { name: 'Peoples Plaza', bookings: 156, revenue: 22108800, percentage: 85 },
    { name: 'Necklace Road', bookings: 134, revenue: 13400000, percentage: 72 },
    { name: 'Lumbini Park', bookings: 98, revenue: 20580000, percentage: 65 },
    { name: 'Sanjeevaiah Park', bookings: 89, revenue: 15575000, percentage: 58 }
  ]);

  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([
    {
      id: '1',
      user: 'John Doe',
      action: 'Created new booking for Peoples Plaza',
      timestamp: new Date('2025-01-15T10:30:00'),
      type: 'booking'
    },
    {
      id: '2',
      user: 'Jane Smith',
      action: 'Payment received ₹22,880',
      timestamp: new Date('2025-01-15T11:45:00'),
      type: 'payment'
    },
    {
      id: '3',
      user: 'Admin User',
      action: 'Updated venue settings for Lumbini Park',
      timestamp: new Date('2025-01-15T09:15:00'),
      type: 'venue'
    },
    {
      id: '4',
      user: 'Mike Johnson',
      action: 'Registered new account',
      timestamp: new Date('2025-01-15T08:00:00'),
      type: 'user'
    },
    {
      id: '5',
      user: 'Sarah Williams',
      action: 'Cancelled booking #BPP20250114004',
      timestamp: new Date('2025-01-14T16:20:00'),
      type: 'booking'
    }
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual API
      // const response = await apiService.getDashboardStats();
      // setStats(response.stats);
      // setRecentBookings(response.recentBookings);
      // setVenuePerformance(response.venuePerformance);
      // setRecentActivity(response.recentActivity);
      setTimeout(() => setLoading(false), 800);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger'> = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'danger'
    };
    const icons: Record<string, React.ReactNode> = {
      confirmed: <CheckCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />
    };
    return (
      <Badge variant={variants[status]}>
        <div className="flex items-center gap-1">
          {icons[status]}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </Badge>
    );
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      booking: <Calendar className="w-4 h-4 text-blue-600" />,
      payment: <DollarSign className="w-4 h-4 text-green-600" />,
      user: <Users className="w-4 h-4 text-purple-600" />,
      venue: <Building2 className="w-4 h-4 text-orange-600" />
    };
    return icons[type] || <Activity className="w-4 h-4 text-gray-600" />;
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.name || 'Admin'}! 👋
            </h1>
            <p className="text-primary-100">
              Here's what's happening with your booking portal today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-3xl font-bold">
                {new Date().toLocaleDateString('en-IN', { day: 'numeric' })}
              </div>
              <div className="text-sm text-primary-100">
                {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              stats.bookingsChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.bookingsChange >= 0 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {Math.abs(stats.bookingsChange)}%
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Bookings</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">
            +{Math.floor(stats.totalBookings * stats.bookingsChange / 100)} from last month
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              stats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.revenueChange >= 0 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {Math.abs(stats.revenueChange)}%
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Revenue (This Month)</h3>
          <p className="text-3xl font-bold text-gray-900">
            ₹{(stats.totalRevenue / 100000).toFixed(1)}L
          </p>
          <p className="text-xs text-gray-500 mt-2">
            ₹{(stats.totalRevenue / 1000).toFixed(0)}k average per booking
          </p>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              stats.usersChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.usersChange >= 0 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {Math.abs(stats.usersChange)}%
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Active Users</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.activeUsers.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">
            {Math.floor(stats.activeUsers * 0.15)} new this month
          </p>
        </div>

        {/* Active Venues */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-orange-600" />
            </div>
            <Badge variant="success">All Active</Badge>
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">Active Venues</h3>
          <p className="text-3xl font-bold text-gray-900">{stats.activeVenues}</p>
          <p className="text-xs text-gray-500 mt-2">
            Out of {stats.activeVenues} total venues
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" />
                Recent Bookings
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Booking #</TableHeaderCell>
                  <TableHeaderCell>Applicant</TableHeaderCell>
                  <TableHeaderCell>Venue</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <div className="font-medium text-primary-600 text-sm">
                        {booking.bookingNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.applicantName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-700">{booking.venue}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-gray-900">
                        ₹{booking.amount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(booking.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Recent Activity - 1 column */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" />
              Recent Activity
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {activity.user}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Venue Performance */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Top Performing Venues
            </h2>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {venuePerformance.map((venue, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{venue.name}</div>
                      <div className="text-xs text-gray-600">
                        {venue.bookings} bookings • ₹{(venue.revenue / 100000).toFixed(1)}L
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-primary-600">
                    {venue.percentage}%
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${venue.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'New Booking', icon: <Calendar />, color: 'bg-blue-500' },
            { label: 'Add Venue', icon: <Building2 />, color: 'bg-green-500' },
            { label: 'View Reports', icon: <BarChart3 />, color: 'bg-purple-500' },
            { label: 'Manage Users', icon: <Users />, color: 'bg-orange-500' }
          ].map((action, index) => (
            <button
              key={index}
              className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-500 hover:shadow-md transition-all text-center group"
            >
              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 text-white group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <div className="text-sm font-semibold text-gray-900">{action.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;