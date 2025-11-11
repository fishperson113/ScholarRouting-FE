import { useMutation } from '@tanstack/react-query';
import { env } from '@/config/env';
import { UserProfile } from '@/types/user';
import { MatchedScholarship, MatchResult } from '@/types/scholarship';

const API_URL = env.API_URL;

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
