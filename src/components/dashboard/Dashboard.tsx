// Dashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  Eye, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  Calendar,
  Clock,
  Edit,
  Archive,
  BarChart3
} from 'lucide-react';

// Stats data interface
interface DashboardStats {
  totalNews: number;
  pressReleases: number;
  goCirculars: number;
  totalViews: number;
  monthlyGrowth: {
    news: number;
    pressReleases: number;
    goCirculars: number;
    views: number;
  };
}

// Mock data - replace with actual API call
const dashboardStats: DashboardStats = {
  totalNews: 156,
  pressReleases: 89,
  goCirculars: 234,
  totalViews: 12500,
  monthlyGrowth: {
    news: 12,
    pressReleases: 8,
    goCirculars: 15,
    views: 23,
  },
};

// Recent Activity interface
interface Activity {
  id: string;
  action: string;
  item: string;
  time: string;
  type: 'news' | 'press_release' | 'go_circular';
  author?: string;
}

const recentActivities: Activity[] = [
  { 
    id: '1',
    action: 'Created', 
    item: 'New Education Policy 2024', 
    time: '2 hours ago', 
    type: 'news',
    author: 'System Administrator'
  },
  { 
    id: '2',
    action: 'Updated', 
    item: 'Healthcare Initiative Press Release', 
    time: '4 hours ago', 
    type: 'press_release',
    author: 'Content Manager'
  },
  { 
    id: '3',
    action: 'Published', 
    item: 'GO/MS No. 123 - Administrative Orders', 
    time: '1 day ago', 
    type: 'go_circular',
    author: 'Admin Officer'
  },
  { 
    id: '4',
    action: 'Archived', 
    item: 'Previous Year Budget Announcement', 
    time: '2 days ago', 
    type: 'news',
    author: 'System Administrator'
  },
];

// Quick Actions interface
interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Create News Article',
    description: 'Add a new news article',
    href: '/content?action=create&type=news',
    icon: FileText,
    color: 'bg-secondary-500',
  },
  {
    title: 'Create Press Release',
    description: 'Publish a press release',
    href: '/content?action=create&type=press_release',
    icon: Edit,
    color: 'bg-green-500',
  },
  {
    title: 'Create GO/Circular',
    description: 'Add government order',
    href: '/content?action=create&type=go_circular',
    icon: Archive,
    color: 'bg-purple-500',
  },
  {
    title: 'View Analytics',
    description: 'Check content performance',
    href: '/analytics',
    icon: BarChart3,
    color: 'bg-orange-500',
  },
];

export const Dashboard: React.FC = () => {
  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return <Plus className="w-4 h-4" />;
      case 'updated':
        return <Edit className="w-4 h-4" />;
      case 'published':
        return <FileText className="w-4 h-4" />;
      case 'archived':
        return <Archive className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'news':
        return 'bg-secondary-100 text-secondary-600';
      case 'press_release':
        return 'bg-green-100 text-green-600';
      case 'go_circular':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return 'text-green-600';
      case 'updated':
        return 'text-secondary-600';
      case 'published':
        return 'text-purple-600';
      case 'archived':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overview of your content management system
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/content?action=create"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Content
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total News */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-secondary-100 rounded-lg">
              <FileText className="w-6 h-6 text-secondary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total News</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalNews}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">
              +{dashboardStats.monthlyGrowth.news}% from last month
            </span>
          </div>
        </div>

        {/* Press Releases */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Edit className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Press Releases</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.pressReleases}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">
              +{dashboardStats.monthlyGrowth.pressReleases}% from last month
            </span>
          </div>
        </div>

        {/* GO/Circulars */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Archive className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">GO/Circulars</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardStats.goCirculars}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">
              +{dashboardStats.monthlyGrowth.goCirculars}% from last month
            </span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Eye className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardStats.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 ml-1">
              +{dashboardStats.monthlyGrowth.views}% from last month
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="group p-4 rounded-lg border-2 border-dashed border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                          {action.title}
                        </p>
                        <p className="text-xs text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <Link 
                to="/activity" 
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getTypeColor(activity.type)} flex-shrink-0`}>
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className={`font-medium ${getActionColor(activity.action)}`}>
                        {activity.action}
                      </span>{' '}
                      <span className="font-medium">{activity.item}</span>
                    </p>
                    <div className="flex items-center mt-1 space-x-3">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                      {activity.author && (
                        <div className="flex items-center">
                          <Users className="w-3 h-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">{activity.author}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Content Overview</h3>
            <Link 
              to="/content" 
              className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View all content
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-3">
                <FileText className="w-8 h-8 text-secondary-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">News Articles</h4>
              <p className="text-sm text-gray-600 mt-1">
                Latest government news and updates
              </p>
              <div className="mt-3">
                <span className="text-2xl font-bold text-secondary-600">{dashboardStats.totalNews}</span>
                <span className="text-sm text-gray-500 ml-2">articles</span>
              </div>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Edit className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Press Releases</h4>
              <p className="text-sm text-gray-600 mt-1">
                Official press statements
              </p>
              <div className="mt-3">
                <span className="text-2xl font-bold text-green-600">{dashboardStats.pressReleases}</span>
                <span className="text-sm text-gray-500 ml-2">releases</span>
              </div>
            </div>

            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Archive className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">GO/Circulars</h4>
              <p className="text-sm text-gray-600 mt-1">
                Government orders and circulars
              </p>
              <div className="mt-3">
                <span className="text-2xl font-bold text-purple-600">{dashboardStats.goCirculars}</span>
                <span className="text-sm text-gray-500 ml-2">documents</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};