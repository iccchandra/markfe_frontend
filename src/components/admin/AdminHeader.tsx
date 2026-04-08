// ============================================
// components/AdminHeader.tsx
// ============================================
import React, { useState } from 'react';
import { 
  Menu, Bell, Search, User, ChevronDown, LogOut, Settings,
  Truck, FileText, Package, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const notifications = [
    { 
      id: 1, 
      title: 'Trip Completed', 
      message: 'Vehicle AP16TY-0677 delivered 650 bags to DCMS SADASHIVPET', 
      time: '10 mins ago', 
      unread: true,
      type: 'success',
      icon: Truck
    },
    { 
      id: 2, 
      title: 'Payment Received', 
      message: 'RO Payment ₹35.08L from M/s Santhoshi Parvathi', 
      time: '1 hour ago', 
      unread: true,
      type: 'success',
      icon: CheckCircle
    },
    { 
      id: 3, 
      title: 'Storage Bill Generated', 
      message: 'Adilabad Godown - May 2025 - ₹10.73L', 
      time: '3 hours ago', 
      unread: false,
      type: 'info',
      icon: FileText
    },
    { 
      id: 4, 
      title: 'Low Stock Alert', 
      message: 'Gunny bags inventory below minimum level at Nizamabad', 
      time: '5 hours ago', 
      unread: true,
      type: 'warning',
      icon: AlertCircle
    },
    { 
      id: 5, 
      title: 'Pending Approvals', 
      message: '12 RO amendments awaiting MD approval', 
      time: '1 day ago', 
      unread: false,
      type: 'info',
      icon: Clock
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleLogout = () => {
    logout();
  };

  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'success': return 'bg-green-100 text-green-600';
      case 'warning': return 'bg-orange-100 text-orange-600';
      case 'error': return 'bg-red-100 text-red-600';
      default: return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left Section - Menu & Logo */}
        <div className="flex items-center flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200 mr-4"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MARKFED
              </h1>
              <p className="text-xs text-gray-500">Telangana State</p>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md ml-8">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips, ROs, vehicles, godowns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Stats (Desktop Only) */}
          <div className="hidden xl:flex items-center gap-4 mr-4 px-4 border-r border-gray-200">
            <div className="text-center">
              <div className="text-xs text-gray-500">Active Trips</div>
              <div className="text-lg font-bold text-blue-600">24</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Pending ROs</div>
              <div className="text-lg font-bold text-orange-600">15</div>
            </div>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className={`p-2 rounded-lg transition-colors duration-200 relative ${
                showNotifications ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                    <button className="text-xs text-blue-600 font-semibold hover:text-blue-700">
                      Mark all as read
                    </button>
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {notifications.map((notification) => {
                      const Icon = notification.icon;
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                            notification.unread ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg ${getNotificationColor(notification.type)} flex-shrink-0`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-gray-900">{notification.title}</span>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1 line-clamp-2">{notification.message}</p>
                              <span className="text-xs text-gray-500">{notification.time}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 text-center border-t border-gray-200 bg-gray-50">
                    <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                      View All Notifications
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                showProfile ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-gray-900 leading-tight">
                  {user?.name || 'Admin User'}
                </div>
                <div className="text-xs text-gray-600 leading-tight capitalize">
                  {user?.role?.replace('_', ' ') || 'System Admin'}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfile(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="text-sm font-bold text-gray-900 mb-1">
                      {user?.name || 'Admin User'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {user?.email || 'admin@markfed.telangana.gov.in'}
                    </div>
                    <div className="text-xs text-blue-600 font-semibold mt-1 capitalize">
                      {user?.role?.replace('_', ' ') || 'System Administrator'}
                    </div>
                  </div>

                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                      <User className="w-4 h-4" />
                      My Profile
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </div>

                  <div className="p-2 border-t border-gray-200">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;