import Logger from './Logger'
import { LogLevel } from './types'

export default class RendererLogger extends Logger {
  constructor(name: string, level: LogLevel = LogLevel.INFO) {
    super(name, level)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #writeLog(level: string, message: string, data?: unknown): void {
    const formattedMessage = this.formatMessage(level, message, data)

    switch (level) {
      case 'DEBUG':
        console.debug(formattedMessage)
        break
      case 'INFO':
        console.info(formattedMessage)
        break
      case 'WARN':
        console.warn(formattedMessage)
        break
      case 'ERROR':
        console.error(formattedMessage)
        break
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.#writeLog('DEBUG', message, data)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.#writeLog('INFO', message, data)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.#writeLog('WARN', message, data)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.#writeLog('ERROR', message, data)
    }
  }
}
