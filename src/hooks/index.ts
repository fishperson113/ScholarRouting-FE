// Auth hooks
export { useAuth } from './use-auth';

// User profile hooks
export { useUserProfile, useUpdateProfile } from '@/lib/user-api';
export type { UserProfile } from '@/lib/user-api';

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
export type { ScholarshipInterest, ScholarshipApplication } from '@/lib/scholarship-api';

// Search & Filter hooks
export {
  useScholarshipSearch,
  useScholarshipFilter,
  useSyncFirestoreToES,
} from '@/lib/search-api';
export type { FilterItem, FilterOperator, SearchResult } from '@/lib/search-api';

// Profile matching hooks
export { useMatchScholarshipsByProfile } from '@/lib/matching-api';
export type { MatchedScholarship, MatchResult } from '@/lib/matching-api';
