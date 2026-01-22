import React, { useEffect, useState } from 'react';
import { BarChart3, FileText, Users, Eye } from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const StatsCards: React.FC = () => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Mock stats - replace with actual API call
      const mockStats: StatCard[] = [
        { 
          title: 'Total News', 
          value: '156', 
          change: '+12%', 
          color: 'bg-blue-500',
          icon: FileText
        },
        { 
          title: 'Press Releases', 
          value: '89', 
          change: '+8%', 
          color: 'bg-green-500',
          icon: FileText
        },
        { 
          title: 'GO/Circulars', 
          value: '234', 
          change: '+15%', 
          color: 'bg-purple-500',
          icon: FileText
        },
        { 
          title: 'Total Views', 
          value: '12.5K', 
          change: '+23%', 
          color: 'bg-orange-500',
          icon: Eye
        },
      ];
      
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="flex items-center">
              <div className="bg-gray-200 p-3 rounded-lg w-12 h-12"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};