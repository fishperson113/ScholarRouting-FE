import Axios, { InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';
import { parseApiError } from '@/utils/api-errors';

// API client configured for your backend

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
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
