import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { Button } from '../Button/Button';

export interface ActionItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export interface TableActionsProps {
  /** Action items */
  actions: ActionItem[];
  /** Trigger element */
  trigger?: 'button' | 'icon';
  /** Size */
  size?: 'sm' | 'md';
}

export const TableActions: React.FC<TableActionsProps> = ({
  actions,
  trigger = 'icon',
  size = 'sm',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: ActionItem) => {
    if (!action.disabled) {
      action.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size={size}
        onClick={() => setIsOpen(!isOpen)}
        iconOnly={trigger === 'icon'}
      >
        {trigger === 'icon' ? (
          <MoreHorizontal className="w-4 h-4" />
        ) : (
          'Actions'
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-20">
            {actions.map((action) => (
              <button
                key={action.key}
                onClick={() => handleAction(action)}
                disabled={action.disabled}
                className={`
                  w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-2
                  ${action.disabled 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : action.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {action.icon && <span>{action.icon}</span>}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Quick action buttons for common use cases
export interface QuickActionsProps {
  /** Edit handler */
  onEdit?: () => void;
  /** Delete handler */
  onDelete?: () => void;
  /** View handler */
  onView?: () => void;
  /** Copy handler */
  onCopy?: () => void;
  /** Size */
  size?: 'sm' | 'md';
  /** Show labels */
  showLabels?: boolean;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onEdit,
  onDelete,
  onView,
  onCopy,
  size = 'sm',
  showLabels = false,
}) => {
  return (
    <div className="flex items-center space-x-1">
      {onView && (
        <Button
          variant="ghost"
          size={size}
          onClick={onView}
          iconOnly={!showLabels}
          leftIcon={showLabels ? <Eye className="w-4 h-4" /> : undefined}
          title="View"
        >
          {showLabels ? 'View' : <Eye className="w-4 h-4" />}
        </Button>
      )}
      
      {onEdit && (
        <Button
          variant="ghost"
          size={size}
          onClick={onEdit}
          iconOnly={!showLabels}
          leftIcon={showLabels ? <Edit className="w-4 h-4" /> : undefined}
          title="Edit"
        >
          {showLabels ? 'Edit' : <Edit className="w-4 h-4" />}
        </Button>
      )}
      
      {onCopy && (
        <Button
          variant="ghost"
          size={size}
          onClick={onCopy}
          iconOnly={!showLabels}
          leftIcon={showLabels ? <Copy className="w-4 h-4" /> : undefined}
          title="Copy"
        >
          {showLabels ? 'Copy' : <Copy className="w-4 h-4" />}
        </Button>
      )}
      
      {onDelete && (
        <Button
          variant="ghost"
          size={size}
          onClick={onDelete}
          iconOnly={!showLabels}
          leftIcon={showLabels ? <Trash2 className="w-4 h-4" /> : undefined}
          title="Delete"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          {showLabels ? 'Delete' : <Trash2 className="w-4 h-4" />}
        </Button>
      )}
    </div>
  );
};