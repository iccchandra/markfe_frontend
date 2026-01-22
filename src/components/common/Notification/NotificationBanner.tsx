import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { NotificationType } from '../../../contexts/NotificationContext';

export interface NotificationBannerProps {
  /** Notification type */
  type: NotificationType;
  /** Title */
  title: string;
  /** Message */
  message?: string;
  /** Show close button */
  closable?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Custom icon */
  icon?: React.ReactNode;
  /** Additional classes */
  className?: string;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  type,
  title,
  message,
  closable = true,
  onClose,
  action,
  icon,
  className = '',
}) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getColors()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          {message && (
            <p className="mt-1 text-sm opacity-90">{message}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {action.label}
            </button>
          )}
        </div>
        {closable && (
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 rounded-md p-1.5 hover:bg-black hover:bg-opacity-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};