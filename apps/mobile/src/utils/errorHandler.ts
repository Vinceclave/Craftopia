// apps/mobile/src/utils/errorHandler.ts
import { Alert } from 'react-native';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
  isNetworkError?: boolean;
}

export class ErrorHandler {
  /**
   * Handle and display API errors
   */
  static handle(error: any, customMessage?: string): void {
    console.error('Error:', error);

    let message = customMessage || 'An error occurred';
    let title = 'Error';

    if (error.isNetworkError) {
      title = 'Network Error';
      message = 'Please check your internet connection and try again.';
    } else if (error.status) {
      switch (error.status) {
        case 400:
          title = 'Invalid Request';
          message = error.message || 'The request could not be processed.';
          break;
        case 401:
          title = 'Authentication Required';
          message = 'Please login again to continue.';
          break;
        case 403:
          title = 'Access Denied';
          message = error.message || 'You do not have permission to perform this action.';
          break;
        case 404:
          title = 'Not Found';
          message = error.message || 'The requested resource was not found.';
          break;
        case 409:
          title = 'Conflict';
          message = error.message || 'This action conflicts with existing data.';
          break;
        case 422:
          title = 'Validation Error';
          message = error.message || 'Please check your input and try again.';
          break;
        case 500:
          title = 'Server Error';
          message = 'Something went wrong on our end. Please try again later.';
          break;
        default:
          message = error.message || `An error occurred (${error.status})`;
      }
    } else if (error.message) {
      message = error.message;
    }

    Alert.alert(title, message, [{ text: 'OK' }]);
  }

  /**
   * Handle errors silently (log only)
   */
  static silent(error: any, context?: string): void {
    const prefix = context ? `[${context}]` : '';
    console.error(`${prefix} Error:`, error);
  }

  /**
   * Get user-friendly error message
   */
  static getMessage(error: any): string {
    if (error.isNetworkError) {
      return 'Network error. Please check your connection.';
    }
    
    if (error.message) {
      return error.message;
    }

    if (error.status) {
      switch (error.status) {
        case 400:
          return 'Invalid request';
        case 401:
          return 'Authentication required';
        case 403:
          return 'Access denied';
        case 404:
          return 'Not found';
        case 409:
          return 'Conflict detected';
        case 422:
          return 'Validation error';
        case 500:
          return 'Server error';
        default:
          return `Error (${error.status})`;
      }
    }

    return 'An unexpected error occurred';
  }

  /**
   * Check if error is a specific type
   */
  static isNetworkError(error: any): boolean {
    return error.isNetworkError === true;
  }

  static isAuthError(error: any): boolean {
    return error.status === 401 || error.message?.includes('SESSION_EXPIRED');
  }

  static isValidationError(error: any): boolean {
    return error.status === 422 || error.status === 400;
  }

  static isServerError(error: any): boolean {
    return error.status >= 500;
  }
}

/**
 * Hook for error handling in components
 */
export const useErrorHandler = () => {
  const handleError = (error: any, customMessage?: string) => {
    ErrorHandler.handle(error, customMessage);
  };

  const getMessage = (error: any): string => {
    return ErrorHandler.getMessage(error);
  };

  return {
    handleError,
    getMessage,
    isNetworkError: ErrorHandler.isNetworkError,
    isAuthError: ErrorHandler.isAuthError,
    isValidationError: ErrorHandler.isValidationError,
    isServerError: ErrorHandler.isServerError,
  };
};