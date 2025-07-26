import { Injectable, LoggerService, Scope } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as winston from "winston";
import * as DailyRotateFile from "winston-daily-rotate-file";
import { LoggingConfig } from "../config/logging.config";

@Injectable({ scope: Scope.TRANSIENT })
export class WinstonLoggerService implements LoggerService {
  private readonly logger: winston.Logger;
  private context?: string;

  constructor(private readonly configService: ConfigService) {
    const loggingConfig = this.configService.get<LoggingConfig>("logging");
    this.logger = this.createLogger(loggingConfig);
  }

  private createLogger(config: LoggingConfig): winston.Logger {
    const transports: winston.transport[] = [];

    // Console transport for development
    if (config.enableConsole) {
      transports.push(
        new winston.transports.Console({
          level: config.level,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(
              ({ timestamp, level, message, context, ...meta }) => {
                const contextStr = context ? `[${context}] ` : "";
                const metaStr = Object.keys(meta).length
                  ? ` ${JSON.stringify(meta)}`
                  : "";
                return `${timestamp} ${level}: ${contextStr}${message}${metaStr}`;
              }
            )
          ),
        })
      );
    }

    // File transports for production
    if (config.enableFileLogging) {
      // Combined logs (all levels)
      transports.push(
        new DailyRotateFile({
          filename: `${config.logDirectory}/combined-%DATE%.log`,
          datePattern: config.datePattern,
          maxFiles: config.maxFiles,
          level: config.level,
          format: winston.format.combine(
            winston.format.timestamp(),
            config.format === "json"
              ? winston.format.json()
              : winston.format.printf(
                  ({ timestamp, level, message, context, ...meta }) => {
                    const contextStr = context ? `[${context}] ` : "";
                    const metaStr = Object.keys(meta).length
                      ? ` ${JSON.stringify(meta)}`
                      : "";
                    return `${timestamp} [${level.toUpperCase()}]: ${contextStr}${message}${metaStr}`;
                  }
                )
          ),
        })
      );

      // Error logs (error level only)
      transports.push(
        new DailyRotateFile({
          filename: `${config.logDirectory}/error-%DATE%.log`,
          datePattern: config.datePattern,
          maxFiles: config.maxFiles,
          level: "error",
          format: winston.format.combine(
            winston.format.timestamp(),
            config.format === "json"
              ? winston.format.json()
              : winston.format.printf(
                  ({ timestamp, level, message, context, stack, ...meta }) => {
                    const contextStr = context ? `[${context}] ` : "";
                    const stackStr = stack ? `\n${stack}` : "";
                    const metaStr = Object.keys(meta).length
                      ? ` ${JSON.stringify(meta)}`
                      : "";
                    return `${timestamp} [${level.toUpperCase()}]: ${contextStr}${message}${metaStr}${stackStr}`;
                  }
                )
          ),
        })
      );
    }

    return winston.createLogger({
      level: config.level,
      transports,
      exitOnError: false,
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context: context || this.context });
  }

  error(message: any, stack?: string, context?: string) {
    this.logger.error(message, {
      context: context || this.context,
      stack,
    });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context: context || this.context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context: context || this.context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context: context || this.context });
  }

  // Additional method for structured logging
  logWithMeta(
    level: string,
    message: string,
    meta: Record<string, any>,
    context?: string
  ) {
    this.logger.log(level, message, {
      ...meta,
      context: context || this.context,
    });
  }

  // Method to get the underlying Winston logger for advanced usage
  getWinstonLogger(): winston.Logger {
    return this.logger;
  }
}
