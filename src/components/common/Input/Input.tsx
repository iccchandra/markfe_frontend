import React, { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { Eye, EyeOff, X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Helper text */
  helperText?: string;
  /** Success message */
  success?: string;
  /** Icon on the left side */
  leftIcon?: React.ReactNode;
  /** Icon on the right side */
  rightIcon?: React.ReactNode;
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  /** Input variant */
  variant?: 'default' | 'filled' | 'underlined' | 'ghost';
  /** Loading state */
  loading?: boolean;
  /** Clearable input */
  clearable?: boolean;
  /** Character counter */
  showCounter?: boolean;
  /** Validation status */
  status?: 'default' | 'error' | 'success' | 'warning';
  /** Prefix text */
  prefix?: string;
  /** Suffix text */
  suffix?: string;
  /** Auto-resize for growing inputs */
  autoGrow?: boolean;
  /** Custom validation function */
  validate?: (value: string) => string | undefined;
  /** Debounce delay for validation */
  debounceMs?: number;
  /** Format input value */
  format?: 'currency' | 'phone' | 'number' | 'uppercase' | 'lowercase' | 'capitalize';
  /** Mask pattern */
  mask?: string;
  /** Show password toggle for password inputs */
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    success,
    leftIcon,
    rightIcon,
    size = 'md',
    variant = 'default',
    loading = false,
    clearable = false,
    showCounter = false,
    status = 'default',
    prefix,
    suffix,
    autoGrow = false,
    validate,
    debounceMs = 300,
    format,
    mask,
    showPasswordToggle = false,
    className = '',
    type = 'text',
    maxLength,
    value: controlledValue,
    onChange,
    onBlur,
    onFocus,
    disabled,
    required,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(controlledValue || '');
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [validationError, setValidationError] = useState<string>();
    // Fix: Use number instead of NodeJS.Timeout for browser environment
    const [debounceTimer, setDebounceTimer] = useState<number>();

    const isControlled = controlledValue !== undefined;
    const inputValue = isControlled ? controlledValue : internalValue;
    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Determine status based on props
    const getStatus = () => {
      if (error || validationError) return 'error';
      if (success) return 'success';
      return status;
    };

    const currentStatus = getStatus();

    // Size configurations
    const sizeClasses = {
      sm: {
        input: 'px-3 py-1.5 text-sm',
        icon: 'w-4 h-4',
        label: 'text-sm',
        helper: 'text-xs',
      },
      md: {
        input: 'px-3 py-2 text-sm',
        icon: 'w-5 h-5',
        label: 'text-sm',
        helper: 'text-sm',
      },
      lg: {
        input: 'px-4 py-3 text-base',
        icon: 'w-5 h-5',
        label: 'text-base',
        helper: 'text-sm',
      },
    };

    // Variant configurations
    const variantClasses = {
      default: 'border border-gray-300 rounded-md bg-white',
      filled: 'border-0 rounded-md bg-gray-100',
      underlined: 'border-0 border-b-2 border-gray-300 rounded-none bg-transparent',
      ghost: 'border-0 bg-transparent',
    };

    // Status configurations
    const statusClasses = {
      default: {
        border: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
        icon: 'text-gray-400',
        bg: '',
      },
      error: {
        border: 'border-red-300 focus:border-red-500 focus:ring-red-500',
        icon: 'text-red-400',
        bg: 'bg-red-50',
      },
      success: {
        border: 'border-green-300 focus:border-green-500 focus:ring-green-500',
        icon: 'text-green-400',
        bg: 'bg-green-50',
      },
      warning: {
        border: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500',
        icon: 'text-yellow-400',
        bg: 'bg-yellow-50',
      },
    };

    // Format input value
    const formatValue = (val: string): string => {
      if (!format || !val) return val;

      switch (format) {
        case 'currency':
          const number = val.replace(/[^\d.]/g, '');
          return number ? `$${parseFloat(number).toFixed(2)}` : '';
        case 'phone':
          const digits = val.replace(/\D/g, '');
          if (digits.length >= 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
          }
          return digits;
        case 'number':
          return val.replace(/[^\d]/g, '');
        case 'uppercase':
          return val.toUpperCase();
        case 'lowercase':
          return val.toLowerCase();
        case 'capitalize':
          return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        default:
          return val;
      }
    };

    // Apply mask pattern
    const applyMask = (val: string): string => {
      if (!mask || !val) return val;
      
      let maskedValue = '';
      let valueIndex = 0;
      
      for (let i = 0; i < mask.length && valueIndex < val.length; i++) {
        if (mask[i] === '9') {
          if (/\d/.test(val[valueIndex])) {
            maskedValue += val[valueIndex];
            valueIndex++;
          } else {
            break;
          }
        } else if (mask[i] === 'A') {
          if (/[A-Za-z]/.test(val[valueIndex])) {
            maskedValue += val[valueIndex];
            valueIndex++;
          } else {
            break;
          }
        } else {
          maskedValue += mask[i];
        }
      }
      
      return maskedValue;
    };

    // Validation with debounce
    useEffect(() => {
      if (validate && inputValue) {
        if (debounceTimer) {
          // Fix: Use window.clearTimeout for browser environment
          window.clearTimeout(debounceTimer);
        }

        // Fix: Use window.setTimeout and cast to number
        const timer = window.setTimeout(() => {
          const result = validate(inputValue.toString());
          setValidationError(result);
        }, debounceMs);

        setDebounceTimer(timer);

        // Fix: Use window.clearTimeout in cleanup
        return () => window.clearTimeout(timer);
      } else {
        setValidationError(undefined);
      }
    }, [inputValue, validate, debounceMs, debounceTimer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      
      // Apply formatting and masking
      if (format) newValue = formatValue(newValue);
      if (mask) newValue = applyMask(newValue);

      if (!isControlled) {
        setInternalValue(newValue);
      }

      if (onChange) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: newValue },
        };
        onChange(syntheticEvent);
      }
    };

    const handleClear = () => {
      const newValue = '';
      if (!isControlled) {
        setInternalValue(newValue);
      }
      
      if (onChange) {
        const syntheticEvent = {
          target: { value: newValue },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    // Character count
    const currentLength = inputValue?.toString().length || 0;
    const showCharacterCount = showCounter && maxLength;

    // Status icon
    const getStatusIcon = () => {
      switch (currentStatus) {
        case 'error':
          return <AlertCircle className={`${sizeClasses[size].icon} text-red-400`} />;
        case 'success':
          return <CheckCircle className={`${sizeClasses[size].icon} text-green-400`} />;
        case 'warning':
          return <Info className={`${sizeClasses[size].icon} text-yellow-400`} />;
        default:
          return null;
      }
    };

    // Build className
    const inputClassName = [
      'block w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
      sizeClasses[size].input,
      variantClasses[variant],
      statusClasses[currentStatus].border,
      currentStatus !== 'default' && variant === 'default' ? statusClasses[currentStatus].bg : '',
      leftIcon || prefix ? 'pl-10' : '',
      rightIcon || suffix || clearable || showPasswordToggle || getStatusIcon() ? 'pr-10' : '',
      disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '',
      loading ? 'animate-pulse' : '',
      className,
    ].filter(Boolean).join(' ');

    return (
      <div className="space-y-1">
        {/* Label */}
        {label && (
          <label className={`block font-medium text-gray-700 ${sizeClasses[size].label}`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Prefix */}
          {prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 text-sm">{prefix}</span>
            </div>
          )}

          {/* Left Icon */}
          {leftIcon && !prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className={statusClasses[currentStatus].icon}>
                {leftIcon}
              </span>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled || loading}
            maxLength={maxLength}
            className={inputClassName}
            {...props}
          />

          {/* Right Side Icons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
            {/* Loading Spinner */}
            {loading && (
              <div className={`${sizeClasses[size].icon} animate-spin rounded-full border-2 border-gray-300 border-t-primary-600`} />
            )}

            {/* Clear Button */}
            {clearable && inputValue && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <X className={sizeClasses[size].icon} />
              </button>
            )}

            {/* Password Toggle */}
            {type === 'password' && showPasswordToggle && !loading && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className={sizeClasses[size].icon} />
                ) : (
                  <Eye className={sizeClasses[size].icon} />
                )}
              </button>
            )}

            {/* Status Icon */}
            {!loading && getStatusIcon()}

            {/* Custom Right Icon */}
            {rightIcon && !loading && !getStatusIcon() && (
              <span className={statusClasses[currentStatus].icon}>
                {rightIcon}
              </span>
            )}

            {/* Suffix */}
            {suffix && (
              <span className="text-gray-500 text-sm">{suffix}</span>
            )}
          </div>
        </div>

        {/* Helper Text and Character Count */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Error Message */}
            {(error || validationError) && (
              <p className={`text-red-600 ${sizeClasses[size].helper} flex items-center mt-1`}>
                <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                {error || validationError}
              </p>
            )}

            {/* Success Message */}
            {success && !error && !validationError && (
              <p className={`text-green-600 ${sizeClasses[size].helper} flex items-center mt-1`}>
                <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                {success}
              </p>
            )}

            {/* Helper Text */}
            {helperText && !error && !validationError && !success && (
              <p className={`text-gray-500 ${sizeClasses[size].helper} mt-1`}>
                {helperText}
              </p>
            )}
          </div>

          {/* Character Counter */}
          {showCharacterCount && (
            <p className={`text-gray-400 ${sizeClasses[size].helper} ml-2 flex-shrink-0`}>
              <span className={currentLength > maxLength! ? 'text-red-500' : ''}>
                {currentLength}
              </span>
              /{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';