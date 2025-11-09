import Axios, { InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';

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
    console.error('API Error:', error);
    return Promise.reject(error);
  },
);
