import * as fs from 'node:fs'
import * as path from 'node:path'
import { app } from 'electron'
import Logger from './Logger'
import { LogLevel, LoggerConfig } from './types'

export default class MainLogger extends Logger {
  #logFilePath: string
  #writeStream: fs.WriteStream | null = null
  #maxFileSize: number
  #maxFiles: number

  constructor(name: string, config: LoggerConfig = {}) {
    super(name, config.level)

    const logDir = config.logDir || path.join(app.getPath('userData'), 'logs')
    this.#maxFileSize = config.maxFileSize || 10 * 1024 * 1024 // 10MB default
    this.#maxFiles = config.maxFiles || 5

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true })
    }

    this.#logFilePath = path.join(logDir, `${name}.log`)
    this.#initializeWriteStream()
    this.#rotateLogsIfNeeded()
  }

  #initializeWriteStream(): void {
    this.#writeStream = fs.createWriteStream(this.#logFilePath, { flags: 'a' })
  }

  #rotateLogsIfNeeded(): void {
    try {
      const stats = fs.statSync(this.#logFilePath)
      if (stats.size >= this.#maxFileSize) {
        this.#rotateLogs()
      }
    } catch (err) {
      // File doesn't exist yet, no rotation needed
    }
  }

  #rotateLogs(): void {
    if (this.#writeStream) {
      this.#writeStream.end()
    }

    // Remove oldest log if we're at max files
    const oldestLog = `${this.#logFilePath}.${this.#maxFiles}`
    if (fs.existsSync(oldestLog)) {
      fs.unlinkSync(oldestLog)
    }

    // Shift all log files
    for (let i = this.#maxFiles - 1; i >= 1; i--) {
      const oldPath = `${this.#logFilePath}.${i}`
      const newPath = `${this.#logFilePath}.${i + 1}`
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath)
      }
    }

    // Rename current log to .1
    if (fs.existsSync(this.#logFilePath)) {
      fs.renameSync(this.#logFilePath, `${this.#logFilePath}.1`)
    }

    this.#initializeWriteStream()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #writeLog(level: string, message: string, data?: any): void {
    const formattedMessage = this.formatMessage(level, message, data)

    // Write to console
    const consoleMethod =
      level === 'ERROR'
        ? console.error
        : level === 'WARN'
          ? console.warn
          : console.log
    consoleMethod(formattedMessage)

    // Write to file
    if (this.#writeStream) {
      this.#writeStream.write(formattedMessage + '\n')

      // Check if rotation is needed after write
      try {
        const stats = fs.statSync(this.#logFilePath)
        if (stats.size >= this.#maxFileSize) {
          this.#rotateLogs()
        }
      } catch (err) {
        // Ignore errors during rotation check
      }
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

  close(): void {
    if (this.#writeStream) {
      this.#writeStream.end()
      this.#writeStream = null
    }
  }
}
