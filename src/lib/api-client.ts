import Axios, { InternalAxiosRequestConfig } from 'axios';

// Simplified API client - configure this when you connect your backend

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = 'application/json';
  }
  config.withCredentials = true;
  return config;
}

// Create axios instance - update baseURL when your backend is ready
export const api = Axios.create({
  baseURL: '/api', // Change this to your backend URL
});

api.interceptors.request.use(authRequestInterceptor);
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  },
);
