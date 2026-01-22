import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Bell } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export type NotificationPosition = 
  | 'top-right' 
  | 'top-left' 
  | 'top-center'
  | 'bottom-right' 
  | 'bottom-left' 
  | 'bottom-center';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
  icon?: ReactNode;
  progress?: boolean;
}

export interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updateNotification: (id: string, updates: Partial<Notification>) => void;
  
  // Convenience methods
  success: (title: string, message?: string, options?: Partial<Notification>) => string;
  error: (title: string, message?: string, options?: Partial<Notification>) => string;
  warning: (title: string, message?: string, options?: Partial<Notification>) => string;
  info: (title: string, message?: string, options?: Partial<Notification>) => string;
  
  // Configuration
  position: NotificationPosition;
  setPosition: (position: NotificationPosition) => void;
  maxNotifications: number;
  setMaxNotifications: (max: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export interface NotificationProviderProps {
  children: ReactNode;
  /** Default position for notifications */
  defaultPosition?: NotificationPosition;
  /** Default duration for notifications */
  defaultDuration?: number;
  /** Maximum number of notifications to show */
  maxNotifications?: number;
  /** Enable sound notifications */
  enableSound?: boolean;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  defaultPosition = 'top-right',
  defaultDuration = 5000,
  maxNotifications = 5,
  enableSound = false,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [position, setPosition] = useState<NotificationPosition>(defaultPosition);
  const [maxNotifs, setMaxNotifications] = useState(maxNotifications);

  // Generate unique ID
  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Play notification sound
  const playNotificationSound = useCallback((type: NotificationType) => {
    if (!enableSound) return;
    
    try {
      const audio = new Audio();
      switch (type) {
        case 'success':
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuR1/LFeSMFl';
          break;
        case 'error':
          audio.src = 'data:audio/wav;base64,UklGRvQDAABXQVZFZm10IBAAAAABAAEAESsAADErAAABAAgAZGF0YdADAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuR1/LFeSMGLILM89mLOAcZZ7zs559NEA1Opu3wuGUZBkCY2fTGfyYGK4DN8tmKOgiMhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuR1/LFeSMFl';
          break;
        case 'warning':
          audio.src = 'data:audio/wav;base64,UklGRvQDAABXQVZFZm10IBAAAAABAAEAESsAADErAAABAAgAZGF0YdADAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuR1/LFeSMFl';
          break;
        default:
          audio.src = 'data:audio/wav;base64,UklGRvQDAABXQVZFZm10IBAAAAABAAEAESsAADErAAABAAgAZGF0YdADAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBzuR1/LFeSMFl';
      }
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if audio can't play
      });
    } catch (error) {
      // Ignore audio errors
    }
  }, [enableSound]);

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? defaultDuration,
    };

    setNotifications(prev => {
      // Remove oldest notifications if we exceed the maximum
      const updated = [...prev, newNotification];
      if (updated.length > maxNotifs) {
        return updated.slice(-maxNotifs);
      }
      return updated;
    });

    // Play sound notification
    playNotificationSound(notification.type);

    // Auto-remove notification after duration (unless persistent)
    if (!notification.persistent && newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, [generateId, defaultDuration, maxNotifs, playNotificationSound]);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Update notification
  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, ...updates } : notification
      )
    );
  }, []);

  // Convenience methods
  const success = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const error = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      persistent: true, // Errors should be persistent by default
      ...options,
    });
  }, [addNotification]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const info = useCallback((title: string, message?: string, options?: Partial<Notification>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options,
    });
  }, [addNotification]);

  const contextValue: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    updateNotification,
    success,
    error,
    warning,
    info,
    position,
    setPosition,
    maxNotifications: maxNotifs,
    setMaxNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Notification Container Component
const NotificationContainer: React.FC = () => {
  const { notifications, position } = useNotification();

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  const isTop = position.startsWith('top');

  return (
    <div
      className={`fixed z-50 pointer-events-none ${positionClasses[position]}`}
      style={{ maxWidth: '420px', width: '100%' }}
    >
      <div className={`space-y-2 ${isTop ? '' : 'flex flex-col-reverse'}`}>
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
};

// Individual Notification Component
interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { removeNotification } = useNotification();
  const [isVisible, setIsVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(100);
  const [isHovered, setIsHovered] = React.useState(false);

  // Animation and progress tracking
  React.useEffect(() => {
    // Show notification
    const showTimer = setTimeout(() => setIsVisible(true), 50);
    
    // Progress countdown
    // Fix: Use number instead of NodeJS.Timeout for browser environment
    let progressInterval: number;
    if (notification.duration && notification.duration > 0 && !notification.persistent && notification.progress) {
      const startTime = Date.now();
      // Fix: Use window.setInterval and cast to number
      progressInterval = window.setInterval(() => {
        if (!isHovered) {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 100 - (elapsed / notification.duration!) * 100);
          setProgress(remaining);
          
          if (remaining === 0) {
            // Fix: Use window.clearInterval
            window.clearInterval(progressInterval);
          }
        }
      }, 50);
    }

    return () => {
      clearTimeout(showTimer);
      // Fix: Use window.clearInterval in cleanup
      if (progressInterval) window.clearInterval(progressInterval);
    };
  }, [notification.duration, notification.persistent, notification.progress, isHovered]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => removeNotification(notification.id), 300);
  };

  const getIcon = () => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          message: 'text-green-700',
          progress: 'bg-green-500',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-900',
          message: 'text-red-700',
          progress: 'bg-red-500',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-900',
          message: 'text-yellow-700',
          progress: 'bg-yellow-500',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          message: 'text-blue-700',
          progress: 'bg-blue-500',
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-900',
          message: 'text-gray-700',
          progress: 'bg-gray-500',
        };
    }
  };

  const colors = getColors();

  return (
    <div
      className={`
        pointer-events-auto transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        relative overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm
        ${colors.bg}
      `}>
        {/* Progress bar */}
        {notification.progress && notification.duration && !notification.persistent && (
          <div className="absolute top-0 left-0 h-1 bg-black bg-opacity-10 w-full">
            <div
              className={`h-full transition-all duration-100 ease-linear ${colors.progress}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start">
            {/* Icon */}
            <div className={`${colors.icon} flex-shrink-0`}>
              {getIcon()}
            </div>

            {/* Content */}
            <div className="ml-3 flex-1">
              <h4 className={`text-sm font-medium ${colors.title}`}>
                {notification.title}
              </h4>
              {notification.message && (
                <p className={`mt-1 text-sm ${colors.message}`}>
                  {notification.message}
                </p>
              )}
              
              {/* Action button */}
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className={`
                    mt-2 text-sm font-medium underline hover:no-underline
                    ${colors.title}
                  `}
                >
                  {notification.action.label}
                </button>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className={`
                ml-4 flex-shrink-0 rounded-md p-1.5 transition-colors
                ${colors.icon} hover:bg-black hover:bg-opacity-10
              `}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};