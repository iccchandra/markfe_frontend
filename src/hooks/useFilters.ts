import { useState, useCallback } from 'react';
import { FilterParams } from '../services/payRecordsApi.service';

interface UseFiltersReturn {
  filters: FilterParams;
  setFilter: (key: keyof FilterParams, value: any) => void;
  setFilters: (newFilters: FilterParams) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const defaultFilters: FilterParams = {
  page: 1,
  limit: 50,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
  dateField: 'bankProcessedDate',
};

export const useFilters = (initialFilters: FilterParams = {}): UseFiltersReturn => {
  const [filters, setFiltersState] = useState<FilterParams>({
    ...defaultFilters,
    ...initialFilters,
  });

  const setFilter = useCallback((key: keyof FilterParams, value: any) => {
    setFiltersState(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1, // Reset to page 1 when other filters change
    }));
  }, []);

  const setFilters = useCallback((newFilters: FilterParams) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState({ ...defaultFilters, ...initialFilters });
  }, [initialFilters]);

  const hasActiveFilters = Object.keys(filters).some(
    key => 
      key !== 'page' && 
      key !== 'limit' && 
      key !== 'sortBy' && 
      key !== 'sortOrder' &&
      key !== 'dateField' &&
      filters[key as keyof FilterParams] !== undefined &&
      filters[key as keyof FilterParams] !== '' &&
      !(Array.isArray(filters[key as keyof FilterParams]) && (filters[key as keyof FilterParams] as any[]).length === 0)
  );

  return {
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  };
};
