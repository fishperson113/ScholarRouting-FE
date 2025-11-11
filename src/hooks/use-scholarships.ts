import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { useScholarshipSearch, useScholarshipFilter } from '@/lib/search-api';
import type { ScholarshipFilters } from '@/types/scholarship';

interface UseScholarshipsOptions {
  collection?: string;
  initialPageSize?: number;
  onError?: (error: Error) => void;
}

export const useScholarships = (options?: UseScholarshipsOptions) => {
  const { collection = 'scholarships_en', initialPageSize = 20, onError } = options || {};
  const { error: showError } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ScholarshipFilters>({});

  // Use the search hook from lib with enabled control
  const searchResult = useScholarshipSearch(
    searchQuery,
    collection,
    {
      size: initialPageSize,
      enabled: searchQuery.trim().length > 0,
    }
  );

  const filterMutation = useScholarshipFilter();

  // Filter data when no search query
  const [filteredData, setFilteredData] = useState<any>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) {
      // Load all scholarships when no filters
      loadWithFilters();
    } else if (!searchQuery.trim() && Object.keys(filters).length > 0) {
      // Apply filters
      loadWithFilters();
    }
  }, [filters]);

  const loadWithFilters = async () => {
    setIsFilterLoading(true);
    try {
      // Convert our filters to the API format
      const filterItems = Object.entries(filters)
        .filter(([_, value]) => value !== undefined && value !== '' && value !== 0)
        .map(([field, value]) => ({
          field,
          values: Array.isArray(value) ? value : [String(value)],
          operator: 'OR' as const,
        }));

      const result = await filterMutation.mutateAsync({
        collection,
        filters: filterItems,
        size: initialPageSize,
      });
      
      setFilteredData(result);
    } catch (err) {
      const error = err as Error;
      showError({
        title: 'Error Loading Scholarships',
        message: error.message || 'Failed to load scholarships. Please try again.',
      });
      onError?.(error);
    } finally {
      setIsFilterLoading(false);
    }
  };

  // Determine which data to use
  const scholarships = searchQuery.trim() 
    ? searchResult.data?.hits || []
    : filteredData?.hits || [];

  const isLoading = searchQuery.trim() 
    ? searchResult.isLoading 
    : isFilterLoading || filterMutation.isPending;

  const total = searchQuery.trim()
    ? searchResult.data?.total || 0
    : filteredData?.total || 0;

  // Update search query
  const setSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Update filters
  const updateFilters = (newFilters: ScholarshipFilters) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  // Refresh scholarships
  const refresh = () => {
    if (searchQuery.trim()) {
      searchResult.refetch();
    } else {
      loadWithFilters();
    }
  };

  return {
    scholarships,
    isLoading,
    searchQuery,
    filters,
    total,
    setSearch,
    updateFilters,
    clearFilters,
    refresh,
  };
};
