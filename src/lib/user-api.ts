import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { env } from '@/config/env';
import { auth } from './firebase';
import { UserProfile } from '@/types/user';

const API_URL = env.API_URL;

// Get current user's ID token
const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
};

// Get user profile
export const useUserProfile = (uid?: string) => {
  return useQuery({
    queryKey: ['user-profile', uid],
    queryFn: async () => {
      const currentUid = uid || auth.currentUser?.uid;
      if (!currentUid) throw new Error('No user ID provided');
      
      const response = await fetch(`${API_URL}/auth/profile/${currentUid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      return response.json() as Promise<UserProfile>;
    },
    enabled: !!uid || !!auth.currentUser,
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ uid, data }: { uid: string; data: Partial<UserProfile> }) => {
      const response = await fetch(`${API_URL}/auth/profile/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      return response.json() as Promise<UserProfile>;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['user-profile', variables.uid], data);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
};
