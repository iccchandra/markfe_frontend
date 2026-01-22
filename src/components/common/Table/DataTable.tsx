import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHeaderCell } from './Table';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';

export interface Column<T> {
  /** Unique key for the column */
  key: keyof T | string;
  /** Column header title */
  title: string;
  /** Custom render function */
  render?: (value: any, record: T, index: number) => React.ReactNode;
  /** Column width */
  width?: string | number;
  /** Sortable column */
  sortable?: boolean;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Fixed column */
  fixed?: 'left' | 'right';
  /** Hidden column */
  hidden?: boolean;
}

export interface DataTableProps<T> {
  /** Table data */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Loading state */
  loading?: boolean;
  /** Row key field */
  rowKey?: keyof T | ((record: T) => string);
  /** Row selection */
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  /** Pagination config */
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
    showSizeChanger?: boolean;
    showQuickJumper?: boolean;
  };
  /** Search functionality */
  searchable?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Row click handler */
  onRowClick?: (record: T, index: number) => void;
  /** Table size */
  size?: 'sm' | 'md' | 'lg';
  /** Empty state message */
  emptyText?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  rowKey = 'id',
  rowSelection,
  pagination,
  searchable = false,
  searchPlaceholder = 'Search...',
  onRowClick,
  size = 'md',
  emptyText = 'No data',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Get row key
  const getRowKey = (record: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey]);
  };

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;
    
    return data.filter((record) =>
      Object.values(record).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm, searchable]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Handle sorting
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  // Handle row selection
  const handleRowSelect = (record: T, selected: boolean) => {
    if (!rowSelection) return;

    const key = getRowKey(record);
    const selectedKeys = rowSelection.selectedRowKeys || [];
    
    let newSelectedKeys: string[];
    if (selected) {
      newSelectedKeys = [...selectedKeys, key];
    } else {
      newSelectedKeys = selectedKeys.filter(k => k !== key);
    }
    
    const selectedRows = sortedData.filter(r => newSelectedKeys.includes(getRowKey(r)));
    rowSelection.onChange?.(newSelectedKeys, selectedRows);
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (!rowSelection) return;

    let newSelectedKeys: string[];
    if (selected) {
      newSelectedKeys = sortedData.map(record => getRowKey(record));
    } else {
      newSelectedKeys = [];
    }
    
    const selectedRows = selected ? sortedData : [];
    rowSelection.onChange?.(newSelectedKeys, selectedRows);
  };

  // Check if all rows are selected
  const isAllSelected = rowSelection && sortedData.length > 0 &&
    sortedData.every(record => rowSelection.selectedRowKeys?.includes(getRowKey(record)));

  // Check if some rows are selected
  const isSomeSelected = rowSelection && rowSelection.selectedRowKeys &&
    rowSelection.selectedRowKeys.length > 0 && !isAllSelected;

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchable && (
        <div className="flex justify-between items-center">
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <Table
        size={size}
        loading={loading}
        empty={sortedData.length === 0}
        emptyMessage={emptyText}
      >
        <TableHeader>
          <TableRow>
            {/* Selection column */}
            {rowSelection && (
              <TableHeaderCell width={50}>
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = !!isSomeSelected;
                  }}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </TableHeaderCell>
            )}
            
            {/* Data columns */}
            {columns.filter(col => !col.hidden).map((column) => (
              <TableHeaderCell
                key={String(column.key)}
                sortable={column.sortable}
                sortDirection={
                  sortConfig?.key === column.key ? sortConfig.direction : null
                }
                onSort={() => column.sortable && handleSort(String(column.key))}
                width={column.width}
                align={column.align}
              >
                {column.title}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedData.map((record, index) => {
            const key = getRowKey(record);
            const isSelected = rowSelection?.selectedRowKeys?.includes(key);
            const checkboxProps = rowSelection?.getCheckboxProps?.(record);

            return (
              <TableRow
                key={key}
                selected={isSelected}
                clickable={!!onRowClick}
                onClick={() => onRowClick?.(record, index)}
              >
                {/* Selection cell */}
                {rowSelection && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={checkboxProps?.disabled}
                      onChange={(e) => handleRowSelect(record, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </TableCell>
                )}

                {/* Data cells */}
                {columns.filter(col => !col.hidden).map((column) => {
                  const value = record[column.key as keyof T];
                  const content = column.render 
                    ? column.render(value, record, index)
                    : String(value || '');

                  return (
                    <TableCell
                      key={String(column.key)}
                      align={column.align}
                      width={column.width}
                    >
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current <= 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            
            <span className="px-3 py-1 text-sm">
              Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}