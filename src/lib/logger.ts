/**
 * Logger Utility
 * 
 * Provides environment-aware logging that:
 * - Only logs in development by default
 * - Can be configured to log in production with LOG_LEVEL env var
 * - Masks sensitive data in logs
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Check if we should log at the given level
 */
function shouldLog(level: LogLevel): boolean {
  // In production, only log warnings and errors by default
  // Can be overridden with LOG_LEVEL env var
  const envLogLevel = process.env.LOG_LEVEL as LogLevel | undefined;
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction && !envLogLevel) {
    // In production without explicit LOG_LEVEL, only log warnings and errors
    return LOG_LEVELS[level] >= LOG_LEVELS.warn;
  }
  
  if (envLogLevel) {
    return LOG_LEVELS[level] >= LOG_LEVELS[envLogLevel];
  }
  
  // In development, log everything
  return true;
}

/**
 * Mask sensitive values in objects for logging
 */
function maskSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  
  const sensitiveKeys = [
    'password',
    'secret',
    'token',
    'access_token',
    'id_token',
    'refresh_token',
    'client_secret',
    'apiToken',
    'authorization',
  ];
  
  const masked: any = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      if (typeof value === 'string' && value.length > 0) {
        masked[key] = value.substring(0, 3) + '***MASKED***';
      } else {
        masked[key] = '***MASKED***';
      }
    } else if (typeof value === 'object') {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}

/**
 * Create a prefixed logger for a specific module
 */
export function createLogger(prefix: string) {
  return {
    debug: (...args: any[]) => {
      if (shouldLog('debug')) {
        console.log(`[${prefix}]`, ...args.map(arg => 
          typeof arg === 'object' ? maskSensitiveData(arg) : arg
        ));
      }
    },
    
    info: (...args: any[]) => {
      if (shouldLog('info')) {
        console.log(`[${prefix}]`, ...args.map(arg => 
          typeof arg === 'object' ? maskSensitiveData(arg) : arg
        ));
      }
    },
    
    warn: (...args: any[]) => {
      if (shouldLog('warn')) {
        console.warn(`[${prefix}]`, ...args.map(arg => 
          typeof arg === 'object' ? maskSensitiveData(arg) : arg
        ));
      }
    },
    
    error: (...args: any[]) => {
      if (shouldLog('error')) {
        console.error(`[${prefix}]`, ...args.map(arg => 
          typeof arg === 'object' ? maskSensitiveData(arg) : arg
        ));
      }
    },
  };
}

// Pre-configured loggers for different modules
export const uaePassLogger = createLogger('UAE PASS');
export const crmLogger = createLogger('CRM');
export const authLogger = createLogger('AUTH');

