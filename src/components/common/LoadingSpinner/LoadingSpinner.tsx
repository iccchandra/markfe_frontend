import React from 'react';
import { Loader2, RotateCw, RefreshCw, Circle, Zap } from 'lucide-react';

export type SpinnerVariant = 
  | 'default' 
  | 'dots' 
  | 'pulse' 
  | 'bounce' 
  | 'wave' 
  | 'ring' 
  | 'dual-ring' 
  | 'bars' 
  | 'grid'
  | 'custom';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Visual variant of the spinner */
  variant?: SpinnerVariant;
  /** Loading text to display */
  text?: string;
  /** Color theme */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white';
  /** Additional CSS classes */
  className?: string;
  /** Show as overlay */
  overlay?: boolean;
  /** Custom icon to use for rotation */
  icon?: React.ReactNode;
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast';
  /** Center the spinner */
  center?: boolean;
  /** Full screen overlay */
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  text,
  color = 'primary',
  className = '',
  overlay = false,
  icon,
  speed = 'normal',
  center = false,
  fullScreen = false,
}) => {
  // Size configurations
  const sizeClasses = {
    xs: { spinner: 'w-3 h-3', text: 'text-xs', gap: 'gap-1' },
    sm: { spinner: 'w-4 h-4', text: 'text-sm', gap: 'gap-2' },
    md: { spinner: 'w-6 h-6', text: 'text-sm', gap: 'gap-2' },
    lg: { spinner: 'w-8 h-8', text: 'text-base', gap: 'gap-3' },
    xl: { spinner: 'w-12 h-12', text: 'text-lg', gap: 'gap-4' },
  };

  // Color configurations
  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    white: 'text-white',
  };

  // Speed configurations
  const speedClasses = {
    slow: 'animate-spin [animation-duration:2s]',
    normal: 'animate-spin',
    fast: 'animate-spin [animation-duration:0.5s]',
  };

  const renderSpinner = () => {
    const baseClasses = `${sizeClasses[size].spinner} ${colorClasses[color]} ${speedClasses[speed]}`;

    switch (variant) {
      case 'default':
        return icon ? (
          <div className={baseClasses}>{icon}</div>
        ) : (
          <Loader2 className={baseClasses} />
        );

      case 'dots':
        return (
          <div className={`flex ${sizeClasses[size].gap}`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses[size].spinner.replace('w-', 'w-').replace('h-', 'h-').split(' ')[0]} ${sizeClasses[size].spinner.replace('w-', 'w-').replace('h-', 'h-').split(' ')[1]} ${colorClasses[color]} rounded-full animate-pulse`}
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        );

      case 'pulse':
        return (
          <div className={`${baseClasses} rounded-full animate-pulse`} style={{ 
            backgroundColor: 'currentColor',
            animationDuration: '1.5s'
          }} />
        );

      case 'bounce':
        return (
          <div className={`flex ${sizeClasses[size].gap}`}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeClasses[size].spinner} ${colorClasses[color]} rounded-full animate-bounce`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  backgroundColor: 'currentColor',
                }}
              />
            ))}
          </div>
        );

      case 'wave':
        return (
          <div className={`flex items-end ${sizeClasses[size].gap}`}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 ${colorClasses[color]} animate-pulse rounded-full`}
                style={{
                  height: size === 'xs' ? '8px' : size === 'sm' ? '12px' : size === 'md' ? '16px' : size === 'lg' ? '20px' : '24px',
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s',
                  backgroundColor: 'currentColor',
                }}
              />
            ))}
          </div>
        );

      case 'ring':
        const ringSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12';
        return (
          <div className={`${ringSize} relative`}>
            <div className={`${ringSize} rounded-full border-2 border-gray-200`} />
            <div className={`${ringSize} rounded-full border-2 border-transparent border-t-current ${colorClasses[color]} animate-spin absolute top-0 left-0`} />
          </div>
        );

      case 'dual-ring':
        const dualRingSize = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12';
        return (
          <div className={`${dualRingSize} relative`}>
            <div className={`${dualRingSize} rounded-full border-2 border-gray-200 border-t-current ${colorClasses[color]} animate-spin`} />
            <div className={`${dualRingSize} rounded-full border-2 border-transparent border-b-current ${colorClasses[color]} animate-spin absolute top-0 left-0`} 
                 style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
        );

      case 'bars':
        return (
          <div className={`flex items-center ${sizeClasses[size].gap}`}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-1 ${colorClasses[color]} animate-pulse rounded-full`}
                style={{
                  height: size === 'xs' ? '12px' : size === 'sm' ? '16px' : size === 'md' ? '20px' : size === 'lg' ? '24px' : '28px',
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1.2s',
                  backgroundColor: 'currentColor',
                }}
              />
            ))}
          </div>
        );

      case 'grid':
        const gridSize = size === 'xs' ? 'w-1 h-1' : size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4';
        return (
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`${gridSize} ${colorClasses[color]} rounded-sm animate-pulse`}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1.5s',
                  backgroundColor: 'currentColor',
                }}
              />
            ))}
          </div>
        );

      case 'custom':
        return (
          <div className={`${baseClasses} relative`}>
            <Circle className="absolute inset-0 opacity-25" />
            <RefreshCw className={`${baseClasses} absolute inset-0`} />
          </div>
        );

      default:
        return <Loader2 className={baseClasses} />;
    }
  };

  const content = (
    <div className={`
      flex flex-col items-center justify-center 
      ${sizeClasses[size].gap} 
      ${center ? 'text-center' : ''} 
      ${className}
    `}>
      {renderSpinner()}
      {text && (
        <p className={`${sizeClasses[size].text} ${colorClasses[color]} font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  // Regular overlay
  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75 backdrop-blur-sm rounded-lg">
        {content}
      </div>
    );
  }

  return content;
};