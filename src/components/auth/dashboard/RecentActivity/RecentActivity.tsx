import React from 'react';

interface Activity {
  action: string;
  item: string;
  time: string;
  type: 'news' | 'press_release' | 'go_circular';
}

const activities: Activity[] = [
  { action: 'Created', item: 'New Education Policy 2024', time: '2 hours ago', type: 'news' },
  { action: 'Updated', item: 'Healthcare Initiative Press Release', time: '4 hours ago', type: 'press_release' },
  { action: 'Published', item: 'GO/MS No. 123 - Administrative Orders', time: '1 day ago', type: 'go_circular' },
  { action: 'Archived', item: 'Previous Year Budget Announcement', time: '2 days ago', type: 'news' },
];

export const RecentActivity: React.FC = () => {
  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'news':
        return 'bg-blue-500';
      case 'press_release':
        return 'bg-green-500';
      case 'go_circular':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white shadow-sm border rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${getTypeColor(activity.type)}`} />
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.action}</span> {activity.item}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};