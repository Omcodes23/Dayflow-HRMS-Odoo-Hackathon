type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isDev = process.env.NODE_ENV === 'development';
const minLevel: LogLevel = isDev ? 'debug' : 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

function formatLog(entry: LogEntry): string {
  const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
  return `${prefix} ${entry.message}${contextStr}`;
}

function createLogEntry(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
  };
}

/**
 * Production-grade logging utility
 * - Respects log levels based on environment
 * - Structured logging with timestamps
 * - Context support for additional metadata
 */
export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (shouldLog('debug')) {
      const entry = createLogEntry('debug', message, context);
      console.debug(formatLog(entry));
    }
  },

  info(message: string, context?: Record<string, unknown>) {
    if (shouldLog('info')) {
      const entry = createLogEntry('info', message, context);
      console.info(formatLog(entry));
    }
  },

  warn(message: string, context?: Record<string, unknown>) {
    if (shouldLog('warn')) {
      const entry = createLogEntry('warn', message, context);
      console.warn(formatLog(entry));
    }
  },

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    if (shouldLog('error')) {
      const errorContext = error instanceof Error
        ? { errorName: error.name, errorMessage: error.message, stack: error.stack }
        : { error };
      const entry = createLogEntry('error', message, { ...errorContext, ...context });
      console.error(formatLog(entry));
    }
  },

  /**
   * Log API request details
   */
  request(method: string, path: string, context?: Record<string, unknown>) {
    this.info(`${method} ${path}`, context);
  },

  /**
   * Log API response details
   */
  response(method: string, path: string, status: number, duration: number) {
    const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    this[level](`${method} ${path} ${status}`, { duration: `${duration}ms` });
  },

  /**
   * Log database operation
   */
  db(operation: string, model: string, context?: Record<string, unknown>) {
    this.debug(`DB ${operation} ${model}`, context);
  },
};

export default logger;
