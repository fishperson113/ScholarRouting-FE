import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { useScholarshipFilter } from '@/lib/search-api';
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
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const filterMutation = useScholarshipFilter();

  // Load scholarships whenever filters or search changes
  useEffect(() => {
    loadScholarships();
  }, [filters, searchQuery]);

  const loadScholarships = async () => {
    setIsLoading(true);
    try {
      // Build filter items from both search query and filters
      const filterItems = [];
      
      // Add search query as a filter if present
      if (searchQuery.trim()) {
        filterItems.push({
          field: 'Scholarship_Name',
          values: [searchQuery.trim()],
          operator: 'OR' as const,
        });
      }
      
      // Add other filters
      Object.entries(filters).forEach(([field, value]) => {
        if (value !== undefined && value !== '' && value !== 0) {
          filterItems.push({
            field,
            values: Array.isArray(value) ? value : [String(value)],
            operator: 'OR' as const,
          });
        }
      });

      const result = await filterMutation.mutateAsync({
        collection,
        filters: filterItems,
        size: initialPageSize,
      });
      
      console.log('API Response:', result);
      
      // Handle the response - the API returns { total, hits, took }
      // Each hit might have different structures, so we normalize it
      const resultData = result as any;
      const items = resultData?.items || resultData?.hits || [];
      
      console.log('Extracted items:', items);
      
      setScholarships(items);
      setTotal(resultData?.total || items.length);
    } catch (err) {
      const error = err as Error;
      console.error('Error loading scholarships:', error);
      showError({
        title: 'Error Loading Scholarships',
        message: error.message || 'Failed to load scholarships. Please try again.',
      });
      onError?.(error);
      setScholarships([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  };

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
    loadScholarships();
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
