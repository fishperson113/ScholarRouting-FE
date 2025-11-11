// Scholarship related types
import type { UserProfile } from './user';

export type ScholarshipInterest = {
  scholarship_id: string;
  scholarship_name?: string;
  added_date?: string;
  notes?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'interested' | 'researching' | 'not_interested';
  [key: string]: any;
};

export type ScholarshipApplication = {
  scholarship_id: string;
  scholarship_name?: string;
  application_date?: string;
  deadline?: string;
  status?: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  documents_submitted?: string[];
  notes?: string;
  [key: string]: any;
};

export type MatchedScholarship = {
  scholarship_id: string;
  scholarship_name: string;
  score: number;
  country?: string;
  funding_level?: string;
  field_of_study?: string;
  [key: string]: any;
};

export type MatchResult = {
  total: number;
  scholarships: MatchedScholarship[];
  user_profile: UserProfile;
};
