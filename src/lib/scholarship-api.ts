import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { env } from '@/config/env';
import { auth } from './firebase';
import { ScholarshipInterest, ScholarshipApplication } from '@/types/scholarship';

const API_URL = env.API_URL;

// ==================== INTERESTS ====================

// Get user's scholarship interests
export const useScholarshipInterests = (uid?: string) => {
  return useQuery({
    queryKey: ['scholarship-interests', uid],
    queryFn: async () => {
      const currentUid = uid || auth.currentUser?.uid;
      if (!currentUid) throw new Error('No user ID provided');
      
      const response = await fetch(`${API_URL}/user/interests/${currentUid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch interests');
      }
      
      return response.json() as Promise<{ uid: string; interests: ScholarshipInterest[] }>;
    },
    enabled: !!uid || !!auth.currentUser,
  });
};

// Add scholarship interest
export const useAddScholarshipInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ uid, interest }: { uid: string; interest: ScholarshipInterest }) => {
      const response = await fetch(`${API_URL}/user/interests/${uid}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interest),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add interest');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scholarship-interests', variables.uid] });
    },
  });
};

// Update scholarship interest
export const useUpdateScholarshipInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ uid, interest }: { uid: string; interest: Partial<ScholarshipInterest> & { scholarship_id: string } }) => {
      const response = await fetch(`${API_URL}/user/interests/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interest),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update interest');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scholarship-interests', variables.uid] });
    },
  });
};

// Delete scholarship interest
export const useDeleteScholarshipInterest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ uid, scholarshipId }: { uid: string; scholarshipId: string }) => {
      const response = await fetch(`${API_URL}/user/interests/${uid}/${scholarshipId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete interest');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scholarship-interests', variables.uid] });
    },
  });
};

// ==================== APPLICATIONS ====================

// Get user's scholarship applications
export const useScholarshipApplications = (uid?: string) => {
  return useQuery({
    queryKey: ['scholarship-applications', uid],
    queryFn: async () => {
      const currentUid = uid || auth.currentUser?.uid;
      if (!currentUid) throw new Error('No user ID provided');
      
      const response = await fetch(`${API_URL}/user/applications/${currentUid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      return response.json() as Promise<{ uid: string; applications: ScholarshipApplication[] }>;
    },
    enabled: !!uid || !!auth.currentUser,
  });
};

// Add scholarship application
export const useAddScholarshipApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ uid, application }: { uid: string; application: ScholarshipApplication }) => {
      const response = await fetch(`${API_URL}/user/applications/${uid}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add application');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scholarship-applications', variables.uid] });
    },
  });
};

// Update scholarship application
export const useUpdateScholarshipApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ uid, application }: { uid: string; application: Partial<ScholarshipApplication> & { scholarship_id: string } }) => {
      const response = await fetch(`${API_URL}/user/applications/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update application');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scholarship-applications', variables.uid] });
    },
  });
};

// Delete scholarship application
export const useDeleteScholarshipApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ uid, scholarshipId }: { uid: string; scholarshipId: string }) => {
      const response = await fetch(`${API_URL}/user/applications/${uid}/${scholarshipId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to delete application');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scholarship-applications', variables.uid] });
    },
  });
};
