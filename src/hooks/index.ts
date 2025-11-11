// Auth hooks
export { useAuth } from './use-auth';

// Toast hooks
export { useToast } from './use-toast';

// Scholarship hooks
export { useScholarships } from './use-scholarships';

// User profile hooks
export { useUserProfile, useUpdateProfile } from '@/lib/user-api';

// Scholarship interests & applications
export {
  useScholarshipInterests,
  useAddScholarshipInterest,
  useUpdateScholarshipInterest,
  useDeleteScholarshipInterest,
  useScholarshipApplications,
  useAddScholarshipApplication,
  useUpdateScholarshipApplication,
  useDeleteScholarshipApplication,
} from '@/lib/scholarship-api';

// Search & Filter hooks
export {
  useScholarshipSearch,
  useScholarshipFilter,
  useSyncFirestoreToES,
} from '@/lib/search-api';

// Profile matching hooks
export { useMatchScholarshipsByProfile } from '@/lib/matching-api';

// Export types from centralized location
export type {
  UserProfile,
} from '@/types/user';

export type {
  ScholarshipInterest,
  ScholarshipApplication,
  MatchedScholarship,
  MatchResult,
  ScholarshipFilters,
} from '@/types/scholarship';

export type {
  FilterItem,
  FilterOperator,
  SearchResult,
} from '@/types/search';
