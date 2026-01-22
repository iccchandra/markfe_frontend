import React, { ReactNode, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { ChevronUp, ChevronDown, ArrowUpDown, MoreHorizontal } from 'lucide-react';

// Base Table Component
export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  /** Table children */
  children: ReactNode;
  /** Table size */
  size?: 'sm' | 'md' | 'lg';
  /** Table variant */
  variant?: 'default' | 'striped' | 'bordered' | 'borderless';
  /** Responsive behavior */
  responsive?: boolean;
  /** Fixed layout */
  fixed?: boolean;
  /** Hover effects */
  hoverable?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state */
  empty?: boolean;
  /** Empty message */
  emptyMessage?: string;
  /** Additional wrapper classes */
  wrapperClassName?: string;
}

export const Table: React.FC<TableProps> = ({
  children,
  size = 'md',
  variant = 'default',
  responsive = true,
  fixed = false,
  hoverable = true,
  loading = false,
  empty = false,
  emptyMessage = 'No data available',
  className = '',
  wrapperClassName = '',
  ...props
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Variant configurations
  const variantClasses = {
    default: '',
    striped: '[&_tbody_tr:nth-child(odd)]:bg-gray-50',
    bordered: 'border border-gray-200',
    borderless: '[&_th]:border-0 [&_td]:border-0',
  };

  const tableClassName = [
    'min-w-full divide-y divide-gray-200',
    sizeClasses[size],
    variantClasses[variant],
    fixed ? 'table-fixed' : 'table-auto',
    hoverable ? '[&_tbody_tr]:hover:bg-gray-50' : '',
    loading ? 'opacity-60 pointer-events-none' : '',
    className,
  ].filter(Boolean).join(' ');

  const wrapperClass = [
    responsive ? 'overflow-x-auto' : '',
    'bg-white shadow-sm border rounded-lg',
    wrapperClassName,
  ].filter(Boolean).join(' ');

  if (empty) {
    return (
      <div className={wrapperClass}>
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <table className={tableClassName} {...props}>
        {children}
      </table>
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
};

// Table Header Component
export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** Header children */
  children: ReactNode;
  /** Sticky header */
  sticky?: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  sticky = false,
  className = '',
  ...props
}) => {
  const headerClassName = [
    'bg-gray-50',
    sticky ? 'sticky top-0 z-10' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <thead className={headerClassName} {...props}>
      {children}
    </thead>
  );
};

// Table Body Component
export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** Body children */
  children: ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

// Table Row Component
export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Row children */
  children: ReactNode;
  /** Selected state */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Clickable row */
  clickable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  selected = false,
  disabled = false,
  clickable = false,
  className = '',
  onClick,
  ...props
}) => {
  const rowClassName = [
    'transition-colors duration-200',
    selected ? 'bg-primary-50 border-primary-200' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    clickable && !disabled ? 'cursor-pointer hover:bg-gray-50' : '',
    className,
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <tr className={rowClassName} onClick={handleClick} {...props}>
      {children}
    </tr>
  );
};

// Table Header Cell Component
export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableHeaderCellElement> {
  /** Header cell children */
  children: ReactNode;
  /** Sortable column */
  sortable?: boolean;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc' | null;
  /** Sort handler */
  onSort?: () => void;
  /** Column width */
  width?: string | number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Resizable column */
  resizable?: boolean;
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  width,
  align = 'left',
  resizable = false,
  className = '',
  ...props
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const headerClassName = [
    'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
    alignClasses[align],
    sortable ? 'cursor-pointer select-none hover:bg-gray-100' : '',
    resizable ? 'resize-x overflow-hidden' : '',
    className,
  ].filter(Boolean).join(' ');

  const style = width ? { width: typeof width === 'number' ? `${width}px` : width } : undefined;

  const handleSort = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  const renderSortIcon = () => {
    if (!sortable) return null;

    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 ml-1" />;
    } else if (sortDirection === 'desc') {
      return <ChevronDown className="w-4 h-4 ml-1" />;
    } else {
      return <ArrowUpDown className="w-4 h-4 ml-1 opacity-50" />;
    }
  };

  return (
    <th
      className={headerClassName}
      style={style}
      onClick={handleSort}
      {...props}
    >
      <div className="flex items-center">
        {children}
        {renderSortIcon()}
      </div>
    </th>
  );
};

// Table Cell Component
export interface TableCellProps extends TdHTMLAttributes<HTMLTableDataCellElement> {
  /** Cell children */
  children: ReactNode;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Truncate text */
  truncate?: boolean;
  /** Column width */
  width?: string | number;
  /** Vertical alignment */
  valign?: 'top' | 'middle' | 'bottom';
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  align = 'left',
  truncate = false,
  width,
  valign = 'middle',
  className = '',
  ...props
}) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right',
  };

  const valignClasses = {
    top: 'align-top',
    middle: 'align-middle',
    bottom: 'align-bottom',
  };

  const cellClassName = [
    'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
    alignClasses[align],
    valignClasses[valign],
    truncate ? 'truncate max-w-0' : '',
    className,
  ].filter(Boolean).join(' ');

  const style = width ? { width: typeof width === 'number' ? `${width}px` : width } : undefined;

  return (
    <td className={cellClassName} style={style} {...props}>
      {truncate ? (
        <div className="truncate" title={typeof children === 'string' ? children : undefined}>
          {children}
        </div>
      ) : (
        children
      )}
    </td>
  );
};