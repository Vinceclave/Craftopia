// apps/backend/src/utils/logger.ts - NEW FILE
import { Request } from 'express';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

interface LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
  userId?: number;
  requestId?: string;
  url?: string;
  method?: string;
  ip?: string;
  stack?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(logContext: LogContext): string {
    const { timestamp, level, message, context, stack } = logContext;
    
    if (this.isDevelopment) {
      // Pretty print for development
      let log = `[${timestamp}] ${level}: ${message}`;
      
      if (context) {
        log += `\n  Context: ${JSON.stringify(context, null, 2)}`;
      }
      
      if (stack) {
        log += `\n  Stack: ${stack}`;
      }
      
      return log;
    } else {
      // JSON format for production (easier to parse)
      return JSON.stringify(logContext);
    }
  }

  private log(level: LogLevel, message: string, context?: any, stack?: string) {
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      stack
    };

    const formattedLog = this.formatLog(logContext);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
    }
  }

  error(message: string, error?: Error | any, context?: any) {
    this.log(
      LogLevel.ERROR,
      message,
      {
        ...context,
        error: error?.message,
        code: error?.code,
        statusCode: error?.statusCode
      },
      error?.stack
    );
  }

  warn(message: string, context?: any) {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: any) {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: any) {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context);
    }
  }

  // Request logger
  logRequest(req: Request, context?: any) {
    const userId = (req as any).user?.userId;
    
    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      userId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      ...context
    });
  }

  // Database operation logger
  logDbOperation(operation: string, model: string, context?: any) {
    this.debug(`DB Operation: ${operation}`, {
      model,
      ...context
    });
  }

  // External service logger
  logExternalService(service: string, operation: string, success: boolean, context?: any) {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    this.log(
      level,
      `External Service: ${service} - ${operation}`,
      {
        service,
        operation,
        success,
        ...context
      }
    );
  }

  // Security event logger
  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', context?: any) {
    const level = severity === 'high' ? LogLevel.ERROR : severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;
    
    this.log(
      level,
      `Security Event: ${event}`,
      {
        event,
        severity,
        ...context
      }
    );
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const logError = logger.error.bind(logger);
export const logWarn = logger.warn.bind(logger);
export const logInfo = logger.info.bind(logger);
export const logDebug = logger.debug.bind(logger);
export const logRequest = logger.logRequest.bind(logger);
export const logDbOperation = logger.logDbOperation.bind(logger);
export const logExternalService = logger.logExternalService.bind(logger);
export const logSecurityEvent = logger.logSecurityEvent.bind(logger);