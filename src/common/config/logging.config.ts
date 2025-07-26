import { registerAs } from "@nestjs/config";

export interface LoggingConfig {
  level: string;
  enableFileLogging: boolean;
  logDirectory: string;
  maxFiles: string;
  datePattern: string;
  format: "json" | "simple";
  enableConsole: boolean;
}

export const loggingConfig = registerAs("logging", (): LoggingConfig => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";

  return {
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
    enableFileLogging: isProduction,
    logDirectory: process.env.LOG_DIRECTORY || "./logs",
    maxFiles: process.env.LOG_MAX_FILES || "7d", // Keep logs for 7 days
    datePattern: process.env.LOG_DATE_PATTERN || "YYYY-MM-DD",
    format: isProduction ? "json" : "simple",
    enableConsole: !isProduction, // Console logging in non-production environments
  };
});
