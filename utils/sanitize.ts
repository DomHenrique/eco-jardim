/**
 * Data Sanitization Utilities
 * Prevents sensitive data from being logged or exposed
 */

/**
 * Mask email address for logging
 * Example: john.doe@example.com -> j***@example.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) {
    return '***';
  }

  const [username, domain] = email.split('@');
  const maskedUsername = username.length > 2
    ? username[0] + '***'
    : '***';

  return `${maskedUsername}@${domain}`;
}

/**
 * Mask user ID for logging
 * Example: 123e4567-e89b-12d3-a456-426614174000 -> 123e***4000
 */
export function maskId(id: string): string {
  if (!id || id.length < 8) {
    return '***';
  }

  return `${id.substring(0, 4)}***${id.substring(id.length - 4)}`;
}

/**
 * Mask sensitive object properties
 */
export function maskSensitiveData<T extends Record<string, any>>(
  data: T,
  sensitiveFields: string[] = ['email', 'password', 'token', 'secret', 'key']
): T {
  const masked = { ...data } as any;

  for (const field of sensitiveFields) {
    if (field in masked) {
      if (field === 'email' && typeof masked[field] === 'string') {
        masked[field] = maskEmail(masked[field]);
      } else if (field.includes('id') && typeof masked[field] === 'string') {
        masked[field] = maskId(masked[field]);
      } else {
        masked[field] = '***';
      }
    }
  }

  return masked as T;
}

/**
 * Sanitize error for logging (remove sensitive stack traces in production)
 */
export function sanitizeError(error: Error): {
  message: string;
  code?: string;
  name: string;
} {
  return {
    message: error.message,
    code: (error as any).code,
    name: error.name,
    // Omit stack trace in production
  };
}

/**
 * Truncate long strings for logging
 */
export function truncate(str: string, maxLength: number = 100): string {
  if (str.length <= maxLength) {
    return str;
  }
  return `${str.substring(0, maxLength)}... (${str.length} chars)`;
}
