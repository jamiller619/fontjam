// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerConfig {
  level?: LogLevel
  logDir?: string
  maxFileSize?: number // in bytes
  maxFiles?: number
}
