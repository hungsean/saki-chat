/**
 * Logger Utility
 * Provides consistent logging across the app with environment-aware controls
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerConfig {
  enabled: boolean;
  prefix: string;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.config.enabled) return;

    const prefix = `[${this.config.prefix}]`;
    const formattedMessage = `${prefix} ${message}`;

    switch (level) {
      case 'info':
        if (data !== undefined) {
          console.log(formattedMessage, data);
        } else {
          console.log(formattedMessage);
        }
        break;
      case 'warn':
        if (data !== undefined) {
          console.warn(formattedMessage, data);
        } else {
          console.warn(formattedMessage);
        }
        break;
      case 'error':
        if (data !== undefined) {
          console.error(formattedMessage, data);
        } else {
          console.error(formattedMessage);
        }
        break;
      case 'debug':
        if (data !== undefined) {
          console.debug(formattedMessage, data);
        } else {
          console.debug(formattedMessage);
        }
        break;
    }
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    // Errors should always be logged, even in production
    const prefix = `[${this.config.prefix}]`;
    const formattedMessage = `${prefix} ${message}`;

    if (data !== undefined) {
      console.error(formattedMessage, data);
    } else {
      console.error(formattedMessage);
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }
}

/**
 * Create a logger instance for a specific module
 */
export function createLogger(prefix: string): Logger {
  return new Logger({
    enabled: import.meta.env.DEV,
    prefix,
  });
}

// Pre-configured loggers for common modules
export const themeLogger = createLogger('Theme');
export const authLogger = createLogger('Auth');
export const storageLogger = createLogger('Storage');
