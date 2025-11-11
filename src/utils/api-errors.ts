import { AxiosError } from 'axios';

interface ApiError {
  message: string;
  statusCode?: number;
  title: string;
}

// Status code to user-friendly message mapping
const getErrorMessage = (statusCode: number, defaultMessage?: string): ApiError => {
  const errorMessages: Record<number, ApiError> = {
    400: {
      title: 'Bad Request',
      message: defaultMessage || 'The request was invalid. Please check your input.',
      statusCode: 400,
    },
    401: {
      title: 'Unauthorized',
      message: 'Please log in to continue.',
      statusCode: 401,
    },
    403: {
      title: 'Forbidden',
      message: 'You do not have permission to perform this action.',
      statusCode: 403,
    },
    404: {
      title: 'Not Found',
      message: defaultMessage || 'The requested resource was not found.',
      statusCode: 404,
    },
    409: {
      title: 'Conflict',
      message: defaultMessage || 'This action conflicts with existing data.',
      statusCode: 409,
    },
    422: {
      title: 'Validation Error',
      message: defaultMessage || 'Please check the form and try again.',
      statusCode: 422,
    },
    429: {
      title: 'Too Many Requests',
      message: 'You are making too many requests. Please slow down.',
      statusCode: 429,
    },
    500: {
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      statusCode: 500,
    },
    502: {
      title: 'Bad Gateway',
      message: 'Unable to reach the server. Please try again later.',
      statusCode: 502,
    },
    503: {
      title: 'Service Unavailable',
      message: 'The service is temporarily unavailable. Please try again later.',
      statusCode: 503,
    },
    504: {
      title: 'Gateway Timeout',
      message: 'The server took too long to respond. Please try again.',
      statusCode: 504,
    },
  };

  return (
    errorMessages[statusCode] || {
      title: 'Error',
      message: defaultMessage || 'An unexpected error occurred. Please try again.',
      statusCode,
    }
  );
};

export const parseApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const statusCode = error.response?.status;
    const backendMessage = error.response?.data?.message;
    
    if (statusCode) {
      return getErrorMessage(statusCode, backendMessage);
    }

    // Network error or no response
    if (error.message === 'Network Error' || !error.response) {
      return {
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
      };
    }
  }

  // Generic error fallback
  return {
    title: 'Error',
    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
  };
};
