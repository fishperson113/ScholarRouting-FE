import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { useScholarshipFilter } from '@/lib/search-api';
import { env } from '@/config/env';
import { SCHOLARSHIP_FIELD_MAPPING, getElasticsearchFieldName } from '@/types/field-mapping';
import type { ScholarshipFilters } from '@/types/scholarship';

const API_URL = env.API_URL;

interface UseScholarshipsOptions {
  collection?: string;
  initialPageSize?: number;
  onError?: (error: Error) => void;
}

export const useScholarships = (options?: UseScholarshipsOptions) => {
  const { collection = 'scholarships_212', initialPageSize = 20, onError } = options || {};
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

  const loadScholarships = async (currentOffset: number = offset, append: boolean = false) => {
    setIsLoading(true);
    try {
      let result: any;
      
      // Use SEARCH endpoint when there's a search query (full-text search)
      if (searchQuery.trim()) {
        const params = new URLSearchParams({
          q: searchQuery.trim(),
          collection,
          size: String(initialPageSize),
          offset: String(currentOffset),
        });
        
        const response = await fetch(`${API_URL}/es/search?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to search scholarships');
        }
        
        result = await response.json();
        console.log('Search API Response:', result);
      } 
      // Use FILTER endpoint when there are filters (exact match)
      else {
        // Build filter items from filters only
        const filterItems = Object.entries(filters)
          .filter(([_, value]) => value !== undefined && value !== '' && value !== 0)
          .map(([field, value]) => ({
            field: getElasticsearchFieldName(field), // Use type-safe field mapping
            values: Array.isArray(value) ? value : [String(value)],
            operator: 'OR' as const,
          }));

        result = await filterMutation.mutateAsync({
          collection,
          filters: filterItems,
          interFieldOperator: 'AND',
          size: initialPageSize,
          offset: currentOffset,
        });
        
        console.log('Filter API Response:', result);
      }
      
      // Handle the response - the API returns { total, hits, took }
      // Each hit might have different structures, so we normalize it
      const resultData = result as any;
      let items = resultData?.items || resultData?.hits || [];
      
      console.log('Extracted items before filtering:', items);
      
      // Client-side filtering for comma-separated fields
      // This handles cases where Eligible_Field_Group contains multiple values separated by commas
      if (filters.fieldOfStudy && items.length > 0) {
        const selectedField = filters.fieldOfStudy;
        items = items.filter((item: any) => {
          const eligibleFieldGroup = item?.Eligible_Field_Group || item?.eligible_field_group || '';
          if (!eligibleFieldGroup) return false;
          
          // Split by comma and trim each value
          const fields = eligibleFieldGroup.split(',').map((f: string) => f.trim());
          
          // Check if any field matches the selected filter
          return fields.some((field: string) => 
            field.toLowerCase() === selectedField.toLowerCase() ||
            field.toLowerCase().includes(selectedField.toLowerCase())
          );
        });
        
        console.log(`Filtered items by fieldOfStudy "${selectedField}":`, items.length);
      }
      
      console.log('Final items:', items);
      
      // Either append to existing scholarships or replace them
      if (append) {
        setScholarships(prev => [...prev, ...items]);
      } else {
        setScholarships(items);
      }
      
      // Update total to reflect filtered count
      setTotal(items.length);
      
      // For client-side filtering, we've loaded all available items
      setHasMore(false);
      
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
