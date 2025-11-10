import { 
  collection, 
  query, 
  getDocs, 
  where, 
  orderBy, 
  limit,
  QueryDocumentSnapshot,
  DocumentData 
} from 'firebase/firestore';
import { useMutation } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { Scholarship, ScholarshipFilters } from './get-scholarships';

export interface FilterScholarshipsInput {
  filters: ScholarshipFilters;
  sortBy?: 'deadline' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
}

export interface FilterScholarshipsResponse {
  scholarships: Scholarship[];
  total: number;
  hasMore: boolean;
  appliedFilters: ScholarshipFilters;
}

// Filter scholarships function
export const filterScholarships = async ({
  filters,
  sortBy = 'createdAt',
  sortOrder = 'desc',
  pageSize = 20
}: FilterScholarshipsInput): Promise<FilterScholarshipsResponse> => {
  try {
    const scholarshipsRef = collection(db, 'scholarships_en');
    let scholarshipQuery = query(scholarshipsRef);

    // Apply filters
    const appliedFilters: ScholarshipFilters = {};

    if (filters.country) {
      scholarshipQuery = query(scholarshipQuery, where('country', '==', filters.country));
      appliedFilters.country = filters.country;
    }
    
    if (filters.type) {
      scholarshipQuery = query(scholarshipQuery, where('type', '==', filters.type));
      appliedFilters.type = filters.type;
    }
    
    if (filters.status) {
      scholarshipQuery = query(scholarshipQuery, where('status', '==', filters.status));
      appliedFilters.status = filters.status;
    }
    
    if (filters.fundingLevel) {
      scholarshipQuery = query(scholarshipQuery, where('fundingLevel', '==', filters.fundingLevel));
      appliedFilters.fundingLevel = filters.fundingLevel;
    }
    
    if (filters.tags && filters.tags.length > 0) {
      scholarshipQuery = query(scholarshipQuery, where('tags', 'array-contains-any', filters.tags));
      appliedFilters.tags = filters.tags;
    }

    // Apply sorting
    scholarshipQuery = query(scholarshipQuery, orderBy(sortBy, sortOrder));

    // Apply limit (get extra to check for more results)
    scholarshipQuery = query(scholarshipQuery, limit(pageSize + 1));

    const querySnapshot = await getDocs(scholarshipQuery);
    const docs = querySnapshot.docs;
    
    // Check if there are more documents
    const hasMore = docs.length > pageSize;
    const scholarshipDocs = hasMore ? docs.slice(0, -1) : docs;

    const scholarships = scholarshipDocs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Scholarship[];

    return {
      scholarships,
      total: scholarships.length,
      hasMore,
      appliedFilters
    };
  } catch (error) {
    console.error('Error filtering scholarships:', error);
    throw new Error('Failed to filter scholarships');
  }
};

// Get available filter options from the database
export const getFilterOptions = async (): Promise<{
  countries: string[];
  types: string[];
  statuses: string[];
  fundingLevels: string[];
  tags: string[];
}> => {
  try {
    const scholarshipsRef = collection(db, 'scholarships_en');
    const querySnapshot = await getDocs(scholarshipsRef);
    
    const countries = new Set<string>();
    const types = new Set<string>();
    const statuses = new Set<string>();
    const fundingLevels = new Set<string>();
    const tags = new Set<string>();

    querySnapshot.docs.forEach(doc => {
      const data = doc.data() as Scholarship;
      
      if (data.country) countries.add(data.country);
      if (data.type) types.add(data.type);
      if (data.status) statuses.add(data.status);
      if (data.fundingLevel) fundingLevels.add(data.fundingLevel);
      if (data.tags) data.tags.forEach(tag => tags.add(tag));
    });

    return {
      countries: Array.from(countries).sort(),
      types: Array.from(types).sort(),
      statuses: Array.from(statuses).sort(),
      fundingLevels: Array.from(fundingLevels).sort(),
      tags: Array.from(tags).sort()
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    throw new Error('Failed to get filter options');
  }
};

// React Query hooks
export const useFilterScholarships = () => {
  return useMutation({
    mutationFn: filterScholarships,
  });
};

export const useFilterOptions = () => {
  return useMutation({
    mutationFn: getFilterOptions,
  });
};