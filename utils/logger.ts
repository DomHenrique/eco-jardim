/**
 * Logger Service - Conditional logging based on environment
 * Only logs in development mode to avoid console pollution in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log errors (only in development)
   * In production, errors should be sent to a monitoring service
   */
  error: (...args: any[]) => {
    if (isDev) {
      console.error(...args);
    }
    // TODO: In production, send to monitoring service (e.g., Sentry, LogRocket)
  },

  /**
   * Log warnings (only in development)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Log with context prefix
   */
  withContext: (context: string) => ({
    log: (...args: any[]) => logger.log(`[${context}]`, ...args),
    error: (...args: any[]) => logger.error(`[${context}]`, ...args),
    warn: (...args: any[]) => logger.warn(`[${context}]`, ...args),
    debug: (...args: any[]) => logger.debug(`[${context}]`, ...args),
  }),
};
