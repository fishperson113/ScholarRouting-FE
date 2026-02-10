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
// Helper function for authenticated fetch calls with Guest Support
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  let token: string | null = null;

  // 1. Try to get Firebase User Token first
  const user = auth.currentUser;
  if (user) {
    try {
      token = await user.getIdToken();
    } catch (error) {
      console.error('Failed to get User ID token:', error);
    }
  }

  // 2. If no user token, try to get/create Guest Session
  if (!token) {
    const guestSessionStr = localStorage.getItem('guest_session');
    let session = null;

    if (guestSessionStr) {
      try {
        session = JSON.parse(guestSessionStr);
        const expiresAt = new Date(session.expires_at);
        // Check if expired
        if (expiresAt <= new Date()) {
          session = null;
          localStorage.removeItem('guest_session');
        }
      } catch (e) {
        localStorage.removeItem('guest_session');
      }
    }

    // Capture token from valid session
    if (session) {
      token = session.guest_token;
    } else {
      // 3. Create NEW Guest Session if none exists
      try {
        // Use standard fetch to avoid infinite loop
        const guestResponse = await fetch(`${env.API_URL}/auth/guest`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (guestResponse.ok) {
          const newSession = await guestResponse.json();
          localStorage.setItem('guest_session', JSON.stringify(newSession));
          token = newSession.guest_token;
          console.log('✨ Guest session created via api-client');
        } else {
          console.warn('Failed to create guest session:', await guestResponse.text());
        }
      } catch (err) {
        console.error('Network error creating guest session:', err);
      }
    }
  }

  // 4. Send Request (with Token if available)
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    // Both User and Guest tokens use Bearer scheme
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

// ==================== Notification API ====================

export const getNotifications = (uid: string) => {
  return api.get(`/user/applications/${uid}/notifications`);
};

export const markNotificationRead = (uid: string, id: string) => {
  return api.put(`/user/applications/${uid}/notifications/${id}/read`);
};
