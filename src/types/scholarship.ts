// Scholarship related types
import type { UserProfile } from './user';

export type ScholarshipFilters = {
  country?: string;
  type?: string;
  status?: string;
  fundingLevel?: string;
  tags?: string[];
  fieldOfStudy?: string;
  degreeLevel?: string;
  minGPA?: number;
  minIELTS?: number;
};

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
  name: string;
  applied_date: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'withdrawn';
  notes: string;
  // Optional fields that may be returned from API
  scholarship_name?: string;
  institution?: string;
  location?: string;
  application_date?: string;
  deadline?: string;
  amount?: string;
  documents_submitted?: string[];
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
