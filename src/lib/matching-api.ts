import { useMutation } from '@tanstack/react-query';
import { env } from '@/config/env';

const API_URL = env.API_URL;

// Types
export type UserProfile = {
  uid: string;
  email: string;
  display_name?: string;
  desired_countries?: string[];
  desired_funding_level?: string[];
  desired_field_of_study?: string[];
  field_of_study?: string;
  gpa_range_4?: number;
  years_of_experience?: number;
  notes?: string;
  tags?: string[];
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

// ==================== PROFILE MATCHING ====================

// Match scholarships by user profile
export const useMatchScholarshipsByProfile = () => {
  return useMutation({
    mutationFn: async ({
      userProfile,
      collection,
      size = 10,
      offset = 0,
    }: {
      userProfile: UserProfile;
      collection: string;
      size?: number;
      offset?: number;
    }) => {
      const params = new URLSearchParams({
        collection,
        size: String(size),
        offset: String(offset),
      });
      
      const response = await fetch(`${API_URL}/user/match-scholarships-by-profile?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to match scholarships');
      }
      
      return response.json() as Promise<MatchResult>;
    },
  });
};
