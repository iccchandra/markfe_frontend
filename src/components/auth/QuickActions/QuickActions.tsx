import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Users, Settings, BarChart3, Upload } from 'lucide-react';
import { Button } from '../../common/Button/Button';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  action: () => void;
  shortcut?: string;
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      title: 'Create News',
      description: 'Add a new news article',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      action: () => navigate('/content?type=news&action=create'),
      shortcut: 'Ctrl+N',
    },
    {
      title: 'Press Release',
      description: 'Create a press release',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      action: () => navigate('/content?type=press_release&action=create'),
      shortcut: 'Ctrl+P',
    },
    {
      title: 'GO/Circular',
      description: 'Add government order',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      action: () => navigate('/content?type=go_circular&action=create'),
      shortcut: 'Ctrl+G',
    },
    {
      title: 'Manage Users',
      description: 'Add or edit users',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      action: () => navigate('/users'),
    },
    {
      title: 'View Analytics',
      description: 'Check content performance',
      icon: BarChart3,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 hover:bg-indigo-100',
      action: () => navigate('/analytics'),
    },
    {
      title: 'Upload Files',
      description: 'Upload media files',
      icon: Upload,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 hover:bg-pink-100',
      action: () => navigate('/media'),
    },
  ];

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            navigate('/content?type=news&action=create');
            break;
          case 'p':
            e.preventDefault();
            navigate('/content?type=press_release&action=create');
            break;
          case 'g':
            e.preventDefault();
            navigate('/content?type=go_circular&action=create');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/content')}
          rightIcon={<FileText className="w-4 h-4" />}
        >
          View All Content
        </Button>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action, index) => {
          const IconComponent = action.icon;
          
          return (
            <div 
              key={index} 
              className="group bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer"
              onClick={action.action}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  action.action();
                }
              }}
            >
              {/* Icon and Header */}
              <div className="flex items-start space-x-4">
                <div className={`
                  p-3 rounded-lg transition-colors duration-200
                  ${action.bgColor}
                `}>
                  <IconComponent className={`h-6 w-6 ${action.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                      {action.title}
                    </h4>
                    {action.shortcut && (
                      <span className="hidden sm:inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        {action.shortcut}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    action.action();
                  }}
                  className="group-hover:border-gray-400 transition-colors"
                >
                  {action.title}
                </Button>
              </div>

              {/* Hover indicator */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-lg"
                   style={{
                     backgroundImage: `linear-gradient(90deg, ${action.color.replace('text-', '').replace('-600', '')}-400, ${action.color.replace('text-', '').replace('-600', '')}-600)`
                   }}
              />
            </div>
          );
        })}
      </div>

      {/* Recent Actions (Optional) */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Actions</h4>
        <div className="flex flex-wrap gap-2">
          {[
            'Created: Education Policy 2024',
            'Updated: Healthcare Initiative',
            'Published: Budget Announcement',
          ].map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-600 border"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};