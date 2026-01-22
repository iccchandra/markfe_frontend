import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';

export type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'warning'
  | 'success'
  | 'info'
  | 'outline' 
  | 'ghost' 
  | 'link'
  | 'gradient';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type ButtonShape = 'default' | 'rounded' | 'pill' | 'square' | 'circle';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content */
  children: ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Button shape */
  shape?: ButtonShape;
  /** Loading state */
  loading?: boolean;
  /** Icon before text */
  leftIcon?: ReactNode;
  /** Icon after text */
  rightIcon?: ReactNode;
  /** Only icon, no text */
  iconOnly?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Dropdown indicator */
  dropdown?: boolean;
  /** Button as a link */
  as?: 'button' | 'a';
  /** Link href (when as="a") */
  href?: string;
  /** Link target */
  target?: string;
  /** Custom loading text */
  loadingText?: string;
  /** Show shadow */
  shadow?: boolean;
  /** Elevated appearance */
  elevated?: boolean;
  /** Ripple effect on click */
  ripple?: boolean;
  /** Tooltip text */
  tooltip?: string;
  /** Badge count */
  badge?: number | string;
  /** Confirmation required */
  confirmText?: string;
  /** Animation on hover */
  animated?: boolean;
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    shape = 'default',
    loading = false,
    leftIcon,
    rightIcon,
    iconOnly = false,
    fullWidth = false,
    dropdown = false,
    as = 'button',
    href,
    target,
    loadingText,
    shadow = false,
    elevated = false,
    ripple = true,
    tooltip,
    badge,
    confirmText,
    animated = true,
    className = '',
    disabled,
    onClick,
    ...props
  }, ref) => {
    // Size configurations
    const sizeClasses = {
      xs: {
        padding: iconOnly ? 'p-1' : 'px-2 py-1',
        text: 'text-xs',
        icon: 'w-3 h-3',
        gap: 'gap-1',
        minHeight: 'min-h-[24px]',
      },
      sm: {
        padding: iconOnly ? 'p-1.5' : 'px-3 py-1.5',
        text: 'text-sm',
        icon: 'w-4 h-4',
        gap: 'gap-1.5',
        minHeight: 'min-h-[32px]',
      },
      md: {
        padding: iconOnly ? 'p-2' : 'px-4 py-2',
        text: 'text-sm',
        icon: 'w-4 h-4',
        gap: 'gap-2',
        minHeight: 'min-h-[40px]',
      },
      lg: {
        padding: iconOnly ? 'p-2.5' : 'px-6 py-2.5',
        text: 'text-base',
        icon: 'w-5 h-5',
        gap: 'gap-2',
        minHeight: 'min-h-[44px]',
      },
      xl: {
        padding: iconOnly ? 'p-3' : 'px-8 py-3',
        text: 'text-lg',
        icon: 'w-5 h-5',
        gap: 'gap-2.5',
        minHeight: 'min-h-[52px]',
      },
    };

    // Shape configurations
    const shapeClasses = {
      default: 'rounded-md',
      rounded: 'rounded-lg',
      pill: 'rounded-full',
      square: 'rounded-none',
      circle: 'rounded-full aspect-square',
    };

    // Variant configurations
    const variantClasses = {
      primary: {
        base: 'bg-primary-600 text-white border border-primary-600',
        hover: 'hover:bg-primary-700 hover:border-primary-700',
        focus: 'focus:ring-primary-500',
        active: 'active:bg-primary-800',
        disabled: 'disabled:bg-primary-300 disabled:border-primary-300',
      },
      secondary: {
        base: 'bg-gray-100 text-gray-900 border border-gray-300',
        hover: 'hover:bg-gray-200 hover:border-gray-400',
        focus: 'focus:ring-gray-500',
        active: 'active:bg-gray-300',
        disabled: 'disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200',
      },
      danger: {
        base: 'bg-red-600 text-white border border-red-600',
        hover: 'hover:bg-red-700 hover:border-red-700',
        focus: 'focus:ring-red-500',
        active: 'active:bg-red-800',
        disabled: 'disabled:bg-red-300 disabled:border-red-300',
      },
      warning: {
        base: 'bg-yellow-500 text-white border border-yellow-500',
        hover: 'hover:bg-yellow-600 hover:border-yellow-600',
        focus: 'focus:ring-yellow-500',
        active: 'active:bg-yellow-700',
        disabled: 'disabled:bg-yellow-300 disabled:border-yellow-300',
      },
      success: {
        base: 'bg-green-600 text-white border border-green-600',
        hover: 'hover:bg-green-700 hover:border-green-700',
        focus: 'focus:ring-green-500',
        active: 'active:bg-green-800',
        disabled: 'disabled:bg-green-300 disabled:border-green-300',
      },
      info: {
        base: 'bg-blue-600 text-white border border-blue-600',
        hover: 'hover:bg-blue-700 hover:border-blue-700',
        focus: 'focus:ring-blue-500',
        active: 'active:bg-blue-800',
        disabled: 'disabled:bg-blue-300 disabled:border-blue-300',
      },
      outline: {
        base: 'bg-transparent text-gray-700 border border-gray-300',
        hover: 'hover:bg-gray-50 hover:border-gray-400',
        focus: 'focus:ring-gray-500',
        active: 'active:bg-gray-100',
        disabled: 'disabled:text-gray-400 disabled:border-gray-200',
      },
      ghost: {
        base: 'bg-transparent text-gray-700 border border-transparent',
        hover: 'hover:bg-gray-100',
        focus: 'focus:ring-gray-500',
        active: 'active:bg-gray-200',
        disabled: 'disabled:text-gray-400',
      },
      link: {
        base: 'bg-transparent text-primary-600 border border-transparent p-0',
        hover: 'hover:text-primary-700 hover:underline',
        focus: 'focus:ring-primary-500',
        active: 'active:text-primary-800',
        disabled: 'disabled:text-gray-400',
      },
      gradient: {
        base: 'bg-gradient-to-r from-primary-600 to-purple-600 text-white border border-transparent',
        hover: 'hover:from-primary-700 hover:to-purple-700',
        focus: 'focus:ring-primary-500',
        active: 'active:from-primary-800 active:to-purple-800',
        disabled: 'disabled:from-gray-300 disabled:to-gray-400',
      },
    };

    // Handle confirmation
    const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
      if (confirmText && !window.confirm(confirmText)) {
        e.preventDefault();
        return;
      }
      
      if (onClick && !loading && !disabled) {
        onClick(e as any);
      }

      // Ripple effect
      if (ripple && !loading && !disabled) {
        createRippleEffect(e);
      }
    };

    // Ripple effect
    const createRippleEffect = (e: React.MouseEvent<HTMLElement>) => {
      const button = e.currentTarget;
      const ripple = document.createElement('span');
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 600ms linear;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
      `;

      // Add ripple keyframes if not already present
      if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
          @keyframes ripple {
            to {
              transform: scale(2);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }

      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    // Build className
    const buttonClassName = [
      // Base styles
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed select-none',
      
      // Size styles
      sizeClasses[size].padding,
      sizeClasses[size].text,
      sizeClasses[size].minHeight,
      
      // Shape styles
      shapeClasses[shape],
      
      // Variant styles
      variantClasses[variant].base,
      !loading && !disabled ? variantClasses[variant].hover : '',
      variantClasses[variant].focus,
      !loading && !disabled ? variantClasses[variant].active : '',
      variantClasses[variant].disabled,
      
      // Additional styles
      fullWidth ? 'w-full' : '',
      shadow ? 'shadow-sm hover:shadow-md' : '',
      elevated ? 'shadow-lg hover:shadow-xl' : '',
      animated ? 'transform hover:scale-105' : '',
      loading ? 'cursor-wait' : '',
      
      // Custom className
      className,
    ].filter(Boolean).join(' ');

    // Content with icons and loading state
    const renderContent = () => {
      if (loading) {
        return (
          <>
            <Loader2 className={`${sizeClasses[size].icon} animate-spin`} />
            {!iconOnly && (
              <span className={sizeClasses[size].gap}>
                {loadingText || 'Loading...'}
              </span>
            )}
          </>
        );
      }

      return (
        <div className={`flex items-center ${!iconOnly ? sizeClasses[size].gap : ''}`}>
          {leftIcon && (
            <span className={sizeClasses[size].icon}>
              {leftIcon}
            </span>
          )}
          
          {!iconOnly && <span>{children}</span>}
          
          {iconOnly && !leftIcon && !rightIcon && children}
          
          {rightIcon && !dropdown && (
            <span className={sizeClasses[size].icon}>
              {rightIcon}
            </span>
          )}
          
          {dropdown && (
            <ChevronDown className={`${sizeClasses[size].icon} ml-1`} />
          )}
        </div>
      );
    };

    // Render as link
    if (as === 'a') {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target={target}
          className={buttonClassName}
          onClick={handleClick}
          title={tooltip}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {renderContent()}
          {badge && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {badge}
            </span>
          )}
        </a>
      );
    }

    // Render as button
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={`${buttonClassName} ${badge ? 'relative' : ''}`}
        disabled={disabled || loading}
        onClick={handleClick}
        title={tooltip}
        {...props}
      >
        {renderContent()}
        {badge && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
            {badge}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';