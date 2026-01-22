import React, { ReactNode } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle, Zap } from 'lucide-react';

export type BadgeVariant = 
  | 'default' 
  | 'primary'
  | 'secondary'
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info'
  | 'light'
  | 'dark'
  | 'outline'
  | 'gradient';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export type BadgeShape = 'default' | 'rounded' | 'pill' | 'square';

export interface BadgeProps {
  /** Badge content */
  children: ReactNode;
  /** Visual variant */
  variant?: BadgeVariant;
  /** Badge size */
  size?: BadgeSize;
  /** Badge shape */
  shape?: BadgeShape;
  /** Icon before text */
  icon?: ReactNode;
  /** Show close button */
  closable?: boolean;
  /** Close callback */
  onClose?: () => void;
  /** Dot indicator instead of content */
  dot?: boolean;
  /** Pulsing animation */
  pulse?: boolean;
  /** Badge as a link */
  href?: string;
  /** Click handler */
  onClick?: () => void;
  /** Maximum count to display */
  max?: number;
  /** Show as count badge */
  count?: number;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Tooltip text */
  title?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'default',
  icon,
  closable = false,
  onClose,
  dot = false,
  pulse = false,
  href,
  onClick,
  max = 99,
  count,
  className = '',
  disabled = false,
  loading = false,
  title,
}) => {
  // Size configurations
  const sizeClasses = {
    xs: {
      text: 'text-xs',
      padding: dot ? 'w-2 h-2' : 'px-2 py-0.5',
      icon: 'w-3 h-3',
      close: 'w-3 h-3',
      gap: 'gap-1',
    },
    sm: {
      text: 'text-xs',
      padding: dot ? 'w-2.5 h-2.5' : 'px-2.5 py-0.5',
      icon: 'w-3 h-3',
      close: 'w-3 h-3',
      gap: 'gap-1',
    },
    md: {
      text: 'text-sm',
      padding: dot ? 'w-3 h-3' : 'px-2.5 py-1',
      icon: 'w-4 h-4',
      close: 'w-4 h-4',
      gap: 'gap-1.5',
    },
    lg: {
      text: 'text-base',
      padding: dot ? 'w-4 h-4' : 'px-3 py-1.5',
      icon: 'w-4 h-4',
      close: 'w-4 h-4',
      gap: 'gap-2',
    },
  };

  // Shape configurations
  const shapeClasses = {
    default: 'rounded',
    rounded: 'rounded-md',
    pill: 'rounded-full',
    square: 'rounded-none',
  };

  // Variant configurations
  const variantClasses = {
    default: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-200',
    },
    primary: {
      bg: 'bg-primary-100',
      text: 'text-primary-800',
      border: 'border-primary-200',
      hover: 'hover:bg-primary-200',
    },
    secondary: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-200',
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      hover: 'hover:bg-green-200',
    },
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      hover: 'hover:bg-yellow-200',
    },
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      hover: 'hover:bg-red-200',
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-200',
    },
    light: {
      bg: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200',
      hover: 'hover:bg-gray-50',
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-white',
      border: 'border-gray-700',
      hover: 'hover:bg-gray-700',
    },
    outline: {
      bg: 'bg-transparent',
      text: 'text-gray-700',
      border: 'border-gray-300',
      hover: 'hover:bg-gray-50',
    },
    gradient: {
      bg: 'bg-gradient-to-r from-primary-500 to-purple-600',
      text: 'text-white',
      border: 'border-transparent',
      hover: 'hover:from-primary-600 hover:to-purple-700',
    },
  };

  // Handle count display
  const displayCount = count !== undefined ? (count > max ? `${max}+` : count.toString()) : null;
  const displayContent = displayCount || children;

  // Handle click
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  // Handle close
  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) {
      onClose();
    }
  };

  // Build className
  const badgeClassName = [
    // Base styles
    'inline-flex items-center font-medium transition-all duration-200',
    
    // Size styles
    sizeClasses[size].text,
    sizeClasses[size].padding,
    dot ? '' : sizeClasses[size].gap,
    
    // Shape styles
    dot ? 'rounded-full' : shapeClasses[shape],
    
    // Variant styles
    variantClasses[variant].bg,
    variantClasses[variant].text,
    variant === 'outline' ? `border ${variantClasses[variant].border}` : '',
    
    // Interactive styles
    (onClick || href) && !disabled ? 'cursor-pointer' : '',
    (onClick || href) && !disabled ? variantClasses[variant].hover : '',
    
    // State styles
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    loading ? 'animate-pulse' : '',
    pulse ? 'animate-pulse' : '',
    
    // Additional classes
    className,
  ].filter(Boolean).join(' ');

  // Render content
  const renderContent = () => {
    if (dot) {
      return null;
    }

    if (loading) {
      return (
        <div className="flex items-center">
          <div className={`${sizeClasses[size].icon} animate-spin rounded-full border-2 border-current border-t-transparent`} />
          {!icon && children && <span className="ml-1">{children}</span>}
        </div>
      );
    }

    return (
      <>
        {icon && (
          <span className={sizeClasses[size].icon}>
            {icon}
          </span>
        )}
        {displayContent && <span>{displayContent}</span>}
        {closable && (
          <button
            onClick={handleClose}
            className={`${sizeClasses[size].close} ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors`}
          >
            <X className="w-full h-full" />
          </button>
        )}
      </>
    );
  };

  // Render as link
  if (href) {
    return (
      <a
        href={href}
        className={badgeClassName}
        title={title}
      >
        {renderContent()}
      </a>
    );
  }

  // Render as button
  if (onClick) {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        className={badgeClassName}
        title={title}
        type="button"
      >
        {renderContent()}
      </button>
    );
  }

  // Render as span
  return (
    <span className={badgeClassName} title={title}>
      {renderContent()}
    </span>
  );
};