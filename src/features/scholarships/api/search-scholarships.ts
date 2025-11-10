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

export interface SearchScholarshipsInput {
  searchQuery: string;
  filters?: ScholarshipFilters;
  sortBy?: 'deadline' | 'createdAt' | 'title' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
}

export interface SearchScholarshipsResponse {
  scholarships: Scholarship[];
  total: number;
  hasMore: boolean;
}

// Search scholarships function
export const searchScholarships = async ({
  searchQuery,
  filters = {},
  sortBy = 'relevance',
  sortOrder = 'desc',
  pageSize = 20
}: SearchScholarshipsInput): Promise<SearchScholarshipsResponse> => {
  try {
    const scholarshipsRef = collection(db, 'scholarships_en');
    let scholarshipQuery = query(scholarshipsRef);

    // Apply filters first
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

    // Apply sorting (except for relevance which is handled client-side)
    if (sortBy !== 'relevance') {
      scholarshipQuery = query(scholarshipQuery, orderBy(sortBy, sortOrder));
    } else {
      // Default sort by createdAt for relevance search
      scholarshipQuery = query(scholarshipQuery, orderBy('createdAt', 'desc'));
    }

    // Apply limit
    scholarshipQuery = query(scholarshipQuery, limit(pageSize * 2)); // Get more for better search results

    const querySnapshot = await getDocs(scholarshipQuery);
    let scholarships = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Scholarship[];

    // Apply client-side search filtering
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
      
      scholarships = scholarships.filter(scholarship => {
        const searchableText = [
          scholarship.title,
          scholarship.organization,
          scholarship.country,
          scholarship.description,
          ...scholarship.tags
        ].join(' ').toLowerCase();

        // Check if all search terms are found
        return searchTerms.every(term => searchableText.includes(term));
      });

      // Sort by relevance if requested
      if (sortBy === 'relevance') {
        scholarships.sort((a, b) => {
          const aScore = calculateRelevanceScore(a, searchTerms);
          const bScore = calculateRelevanceScore(b, searchTerms);
          return sortOrder === 'desc' ? bScore - aScore : aScore - bScore;
        });
      }
    }

    // Apply pagination
    const paginatedScholarships = scholarships.slice(0, pageSize);
    const hasMore = scholarships.length > pageSize;

    return {
      scholarships: paginatedScholarships,
      total: scholarships.length,
      hasMore
    };
  } catch (error) {
    console.error('Error searching scholarships:', error);
    throw new Error('Failed to search scholarships');
  }
};

// Calculate relevance score for search results
const calculateRelevanceScore = (scholarship: Scholarship, searchTerms: string[]): number => {
  let score = 0;
  const titleLower = scholarship.title.toLowerCase();
  const orgLower = scholarship.organization.toLowerCase();
  const descLower = scholarship.description.toLowerCase();
  const tagsLower = scholarship.tags.map(tag => tag.toLowerCase());

  searchTerms.forEach(term => {
    // Title matches get highest score
    if (titleLower.includes(term)) {
      score += 10;
      // Exact title match gets bonus
      if (titleLower === term) score += 20;
    }
    
    // Organization matches get high score
    if (orgLower.includes(term)) {
      score += 8;
    }
    
    // Tag matches get medium score
    if (tagsLower.some(tag => tag.includes(term))) {
      score += 6;
    }
    
    // Description matches get lower score
    if (descLower.includes(term)) {
      score += 3;
    }
  });

  return score;
};

// React Query hook for search
export const useSearchScholarships = () => {
  return useMutation({
    mutationFn: searchScholarships,
  });
};