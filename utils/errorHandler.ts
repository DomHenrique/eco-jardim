/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

import { logger } from './logger';

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: string;
  originalError?: any;
}

/**
 * Create a standardized error object
 */
export function createError(
  message: string,
  options?: {
    code?: string;
    statusCode?: number;
    context?: string;
    originalError?: any;
  }
): AppError {
  const error = new Error(message) as AppError;
  
  if (options) {
    error.code = options.code;
    error.statusCode = options.statusCode;
    error.context = options.context;
    error.originalError = options.originalError;
  }

  return error;
}

/**
 * Handle errors consistently across the application
 */
export const errorHandler = {
  /**
   * Handle and log an error
   */
  handle(error: Error | AppError, context?: string): void {
    const appError = error as AppError;
    const errorContext = context || appError.context || 'Unknown';

    // Log in development
    logger.error(`[${errorContext}] Error:`, {
      message: error.message,
      code: appError.code,
      statusCode: appError.statusCode,
      stack: error.stack,
    });

    // TODO: In production, send to monitoring service
    // Example: Sentry.captureException(error, { tags: { context: errorContext } });
  },

  /**
   * Handle async errors with try-catch wrapper
   */
  async handleAsync<T>(
    fn: () => Promise<T>,
    context: string,
    fallbackValue?: T
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      this.handle(error as Error, context);
      return fallbackValue;
    }
  },

  /**
   * Create a user-friendly error message
   */
  getUserMessage(error: Error | AppError): string {
    const appError = error as AppError;

    // Map common error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'auth/invalid-email': 'Email inválido',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Este email já está em uso',
      'network-error': 'Erro de conexão. Verifique sua internet.',
      'timeout': 'A operação demorou muito. Tente novamente.',
      'permission-denied': 'Você não tem permissão para esta ação',
    };

    if (appError.code && errorMessages[appError.code]) {
      return errorMessages[appError.code];
    }

    // Generic fallback message
    return 'Ocorreu um erro. Por favor, tente novamente.';
  },
};
