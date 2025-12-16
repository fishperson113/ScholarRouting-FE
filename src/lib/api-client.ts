import Axios, { InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';
import { parseApiError } from '@/utils/api-errors';
import { auth } from '@/lib/firebase';

// API client configured for your backend

async function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
    
    // Check for guest session first
    const guestSessionStr = localStorage.getItem('guest_session');
    if (guestSessionStr) {
      try {
        const session = JSON.parse(guestSessionStr);
        const expiresAt = new Date(session.expires_at);
        
        // Use guest token if still valid
        if (expiresAt > new Date()) {
          config.headers.Authorization = `Bearer ${session.guest_token}`;
          config.withCredentials = true;
          return config;
        } else {
          // Session expired, remove it
          localStorage.removeItem('guest_session');
        }
      } catch (error) {
        console.error('Failed to parse guest session:', error);
      }
    }
    
    // Add Firebase ID token if user is authenticated
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error('Failed to get ID token:', error);
      }
    }
  }
  config.withCredentials = true;
  return config;
}

// Create axios instance with your backend URL
export const api = Axios.create({
  baseURL: env.API_URL,
});

api.interceptors.request.use(authRequestInterceptor);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { title, message } = parseApiError(error);
    
    // Import dynamically to avoid circular dependencies
    import('@/components/ui/notifications').then(({ useNotifications }) => {
      const { addNotification } = useNotifications.getState();
      addNotification({
        type: 'error',
        title,
        message,
      });
    });

    return Promise.reject(error);
  },
);

// Helper function for authenticated fetch calls
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  let token: string | null = null;
  
  // Check for guest session first
  const guestSessionStr = localStorage.getItem('guest_session');
  if (guestSessionStr) {
    try {
      const session = JSON.parse(guestSessionStr);
      const expiresAt = new Date(session.expires_at);
      
      if (expiresAt > new Date()) {
        token = session.guest_token;
      } else {
        localStorage.removeItem('guest_session');
      }
    } catch (error) {
      console.error('Failed to parse guest session:', error);
    }
  }
  
  // Use Firebase token if no guest session
  if (!token) {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    token = await user.getIdToken();
  }
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};
