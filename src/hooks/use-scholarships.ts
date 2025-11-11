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
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const filterMutation = useScholarshipFilter();

  // Reset and load scholarships when filters or search changes
  useEffect(() => {
    setOffset(0);
    setScholarships([]);
    loadScholarships(0, false);
  }, [filters, searchQuery]);

  // Reset and load scholarships when filters or search changes
  useEffect(() => {
    setOffset(0);
    setScholarships([]);
    loadScholarships(0, false);
  }, [filters, searchQuery]);

  const loadScholarships = async (currentOffset: number = offset, append: boolean = false) => {
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
        offset: currentOffset,
      });
      
      console.log('API Response:', result);
      
      // Handle the response - the API returns { total, hits, took }
      // Each hit might have different structures, so we normalize it
      const resultData = result as any;
      const items = resultData?.items || resultData?.hits || [];
      
      console.log('Extracted items:', items);
      
      // Either append to existing scholarships or replace them
      if (append) {
        setScholarships(prev => [...prev, ...items]);
      } else {
        setScholarships(items);
      }
      
      setTotal(resultData?.total || 0);
      
      // Check if there are more items to load
      const newTotalLoaded = append ? scholarships.length + items.length : items.length;
      setHasMore(newTotalLoaded < (resultData?.total || 0));
      
    } catch (err) {
      const error = err as Error;
      console.error('Error loading scholarships:', error);
      showError({
        title: 'Error Loading Scholarships',
        message: error.message || 'Failed to load scholarships. Please try again.',
      });
      onError?.(error);
      
      if (!append) {
        setScholarships([]);
        setTotal(0);
      }
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

  // Load more scholarships (pagination)
  const loadMore = () => {
    if (!isLoading && hasMore) {
      const newOffset = offset + initialPageSize;
      setOffset(newOffset);
      loadScholarships(newOffset, true);
    }
  };

  // Refresh scholarships (reset to first page)
  const refresh = () => {
    setOffset(0);
    setScholarships([]);
    loadScholarships(0, false);
  };

  return {
    scholarships,
    isLoading,
    searchQuery,
    filters,
    total,
    hasMore,
    setSearch,
    updateFilters,
    clearFilters,
    loadMore,
    refresh,
  };
};
