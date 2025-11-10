import { 
  collection, 
  query, 
  getDocs, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData 
} from 'firebase/firestore';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase';

export interface Scholarship {
  id: string;
  title: string;
  organization: string;
  country: string;
  type: string;
  status: string;
  description: string;
  fundingLevel: string;
  deadline: string;
  requiredDegree: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ScholarshipFilters {
  country?: string;
  type?: string;
  status?: string;
  fundingLevel?: string;
  tags?: string[];
}

export interface ScholarshipSearchParams {
  searchQuery?: string;
  filters?: ScholarshipFilters;
  sortBy?: 'deadline' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
}

// Get scholarships with search and filter
export const getScholarships = async ({
  searchQuery = '',
  filters = {},
  sortBy = 'createdAt',
  sortOrder = 'desc',
  pageSize = 10,
  lastDoc
}: ScholarshipSearchParams & { lastDoc?: QueryDocumentSnapshot<DocumentData> }): Promise<{
  scholarships: Scholarship[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}> => {
  try {
    const scholarshipsRef = collection(db, 'scholarships_en');
    let scholarshipQuery = query(scholarshipsRef);

    // Apply filters
    if (filters.country) {
      scholarshipQuery = query(scholarshipQuery, where('country', '==', filters.country));
    }
    if (filters.type) {
      scholarshipQuery = query(scholarshipQuery, where('type', '==', filters.type));
    }
    if (filters.status) {
      scholarshipQuery = query(scholarshipQuery, where('status', '==', filters.status));
    }
    if (filters.fundingLevel) {
      scholarshipQuery = query(scholarshipQuery, where('fundingLevel', '==', filters.fundingLevel));
    }
    if (filters.tags && filters.tags.length > 0) {
      scholarshipQuery = query(scholarshipQuery, where('tags', 'array-contains-any', filters.tags));
    }

    // Apply sorting
    scholarshipQuery = query(scholarshipQuery, orderBy(sortBy, sortOrder));

    // Apply pagination
    if (lastDoc) {
      scholarshipQuery = query(scholarshipQuery, startAfter(lastDoc));
    }
    scholarshipQuery = query(scholarshipQuery, limit(pageSize + 1)); // Get one extra to check if there are more

    const querySnapshot = await getDocs(scholarshipQuery);
    const docs = querySnapshot.docs;
    
    // Check if there are more documents
    const hasMore = docs.length > pageSize;
    const scholarshipDocs = hasMore ? docs.slice(0, -1) : docs;
    const newLastDoc = scholarshipDocs.length > 0 ? scholarshipDocs[scholarshipDocs.length - 1] : null;

    let scholarships = scholarshipDocs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Scholarship[];

    // Apply client-side search filtering if searchQuery is provided
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      scholarships = scholarships.filter(scholarship =>
        scholarship.title.toLowerCase().includes(searchLower) ||
        scholarship.organization.toLowerCase().includes(searchLower) ||
        scholarship.country.toLowerCase().includes(searchLower) ||
        scholarship.description.toLowerCase().includes(searchLower) ||
        scholarship.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return {
      scholarships,
      lastDoc: newLastDoc,
      hasMore: hasMore && scholarships.length === pageSize
    };
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    throw new Error('Failed to fetch scholarships');
  }
};

// React Query hook for scholarships with search
export const useScholarships = (params: ScholarshipSearchParams = {}) => {
  return useQuery({
    queryKey: ['scholarships', params],
    queryFn: () => getScholarships(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// React Query hook for infinite scrolling scholarships
export const useInfiniteScholarships = (params: ScholarshipSearchParams = {}) => {
  return useInfiniteQuery({
    queryKey: ['scholarships-infinite', params],
    queryFn: ({ pageParam }) => getScholarships({ ...params, lastDoc: pageParam }),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.lastDoc : undefined,
    initialPageParam: undefined as QueryDocumentSnapshot<DocumentData> | undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get scholarship query options for prefetching
export const getScholarshipsQueryOptions = (params: ScholarshipSearchParams = {}) => ({
  queryKey: ['scholarships', params],
  queryFn: () => getScholarships(params),
  staleTime: 1000 * 60 * 5,
});