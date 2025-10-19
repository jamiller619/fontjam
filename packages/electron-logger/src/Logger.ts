import { LogLevel } from './types'

export default abstract class Logger {
  protected level: LogLevel
  protected name: string

  constructor(name: string, level: LogLevel = LogLevel.INFO) {
    this.name = name
    this.level = level
  }

  setLevel(level: LogLevel): void {
    this.level = level
  }

  protected shouldLog(level: LogLevel): boolean {
    return level >= this.level
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` ${JSON.stringify(data)}` : ''

    return `[${timestamp}] [${level}] [${this.name}] ${message}${dataStr}`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract debug(message: string, data?: any): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract info(message: string, data?: any): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract warn(message: string, data?: any): void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract error(message: string, data?: any): void
}
