import pino, { Logger as PinoLogger, LevelWithSilent } from 'pino';

// Simple logger wrapper for consistent logging across services
export class Logger {
  private static instance: Logger;
  private logger: PinoLogger;

  private constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'info',
      transport: process.env.NODE_ENV === 'development' 
        ? { target: 'pino-pretty', options: { colorize: true } } 
        : undefined,
      timestamp: () => `,"time":"${new Date().toISOString()}"`,
    });
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(meta, message);
  }

  public error(message: string, meta?: Record<string, unknown>): void {
    this.logger.error(meta, message);
  }

  public warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(meta, message);
  }

  public debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(meta, message);
  }

  public fatal(message: string, meta?: Record<string, unknown>): void {
    this.logger.fatal(meta, message);
  }
}

// Export a singleton instance
export const logger = Logger.getInstance();
export default logger;
