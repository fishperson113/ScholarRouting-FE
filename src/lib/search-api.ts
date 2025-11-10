import { useQuery, useMutation } from '@tanstack/react-query';
import { env } from '@/config/env';

const API_URL = env.API_URL;

// Types
export type FilterOperator = 'AND' | 'OR';

export type FilterItem = {
  field: string;
  values: string[];
  operator: FilterOperator;
};

export type SearchResult = {
  total: number;
  hits: any[];
  took: number;
};

// ==================== SEARCH ====================

// Keyword search
export const useScholarshipSearch = (
  query: string,
  collection: string,
  options?: {
    size?: number;
    offset?: number;
    enabled?: boolean;
  }
) => {
  return useQuery({
    queryKey: ['scholarship-search', query, collection, options?.size, options?.offset],
    queryFn: async () => {
      const params = new URLSearchParams({
        q: query,
        collection,
        size: String(options?.size || 10),
        offset: String(options?.offset || 0),
      });
      
      const response = await fetch(`${API_URL}/es/search?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to search scholarships');
      }
      
      return response.json() as Promise<SearchResult>;
    },
    enabled: options?.enabled !== false && !!query && !!collection,
  });
};

// ==================== FILTER ====================

// Advanced filter
export const useScholarshipFilter = () => {
  return useMutation({
    mutationFn: async ({
      collection,
      filters,
      interFieldOperator = 'AND',
      size = 10,
      offset = 0,
    }: {
      collection: string;
      filters: FilterItem[];
      interFieldOperator?: FilterOperator;
      size?: number;
      offset?: number;
    }) => {
      const params = new URLSearchParams({
        collection,
        size: String(size),
        offset: String(offset),
        inter_field_operator: interFieldOperator,
      });
      
      const response = await fetch(`${API_URL}/es/filter?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      });
      
      if (!response.ok) {
        throw new Error('Failed to filter scholarships');
      }
      
      return response.json() as Promise<SearchResult>;
    },
  });
};

// ==================== SYNC ====================

// Sync Firestore to Elasticsearch
export const useSyncFirestoreToES = () => {
  return useMutation({
    mutationFn: async (collection: string) => {
      const params = new URLSearchParams({ collection });
      
      const response = await fetch(`${API_URL}/es/sync?${params}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync collection');
      }
      
      return response.json() as Promise<{ status: string; indexed: number; collection: string }>;
    },
  });
};
