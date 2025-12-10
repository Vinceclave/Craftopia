// apps/mobile/src/utils/errorHandler.ts
import { ModalService, useModal } from '../context/modalContext';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
  isNetworkError?: boolean;
}

export class ErrorHandler {
  /**
   * Parse and extract error details
   */
  static parse(error: any, customMessage?: string): { title: string; message: string } {
    let message = customMessage || 'An error occurred';
    let title = 'Error';

    if (error?.isNetworkError) {
      title = 'Network Error';
      message = 'Please check your internet connection and try again.';
    } else if (error?.status) {
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
    } else if (error?.message) {
      message = error.message;
    }

    return { title, message };
  }

  /**
   * Handle and display API errors (Static/Legacy fallback)
   */
  static handle(error: any, customMessage?: string): void {
    const { title, message } = this.parse(error, customMessage);
    // Use ModalService for static context
    ModalService.show({
      title,
      message,
      type: 'error',
    });
  }

  /**
   * Handle errors silently (log only if needed, currently no-op)
   */
  static silent(error: any, context?: string): void {
    // Intentionally empty to remove console logs
  }

  /**
   * Get user-friendly error message
   */
  static getMessage(error: any): string {
    if (error?.isNetworkError) {
      return 'Network error. Please check your connection.';
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.status) {
      switch (error.status) {
        case 400: return 'Invalid request';
        case 401: return 'Authentication required';
        case 403: return 'Access denied';
        case 404: return 'Not found';
        case 409: return 'Conflict detected';
        case 422: return 'Validation error';
        case 500: return 'Server error';
        default: return `Error (${error.status})`;
      }
    }

    return 'An unexpected error occurred';
  }

  /**
   * Check if error is a specific type
   */
  static isNetworkError(error: any): boolean {
    return error?.isNetworkError === true;
  }

  static isAuthError(error: any): boolean {
    return error?.status === 401 || error?.message?.includes('SESSION_EXPIRED');
  }

  static isValidationError(error: any): boolean {
    return error?.status === 422 || error?.status === 400;
  }

  static isServerError(error: any): boolean {
    return error?.status >= 500;
  }
}

/**
 * Hook for unified error and message handling
 */
export const useErrorHandler = () => {
  const { showModal } = useModal();

  const handleError = (error: any, customMessage?: string) => {
    const { title, message } = ErrorHandler.parse(error, customMessage);

    showModal({
      title,
      message,
      type: 'error',
    });
  };

  const showSuccess = (message: string, title: string = 'Success') => {
    showModal({
      title,
      message,
      type: 'success',
    });
  };

  const showInfo = (message: string, title: string = 'Info') => {
    showModal({
      title,
      message,
      type: 'info',
    });
  };

  const getMessage = (error: any): string => {
    return ErrorHandler.getMessage(error);
  };

  return {
    handleError,
    showSuccess,
    showInfo,
    getMessage,
    isNetworkError: ErrorHandler.isNetworkError,
    isAuthError: ErrorHandler.isAuthError,
    isValidationError: ErrorHandler.isValidationError,
    isServerError: ErrorHandler.isServerError,
  };
};