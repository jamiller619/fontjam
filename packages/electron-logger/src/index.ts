import BaseLogger from './Logger'
import MainLogger from './MainLogger'
import RendererLogger from './RendererLogger'
import { LoggerConfig } from './types'

/**
 * // In main process
 * import { createLogger, LogLevel } from '@fontjam/logger';
 *
 * const logger = createLogger('main', {
 *    level: LogLevel.DEBUG,
 *    maxFileSize: 5 * 1024 * 1024, // 5MB
 *    maxFiles: 3
 * });
 *
 * logger.info('App started');
 * logger.error('Something went wrong', { error: 'details' });
 *
 * // In renderer process
 * import { createLogger } from '@fontjam/logger';
 *
 * const logger = createLogger('renderer');
 * logger.debug('Component mounted');
 *
 * @param name    The prefix name for the logger (e.g., 'main', 'renderer')
 * @param config  Optional config
 * @returns
 */
export function createLogger(name: string, config?: LoggerConfig): BaseLogger {
  const isMain =
    typeof process !== 'undefined' &&
    (process.type === 'browser' || process.type === 'utility')

  if (isMain) {
    return new MainLogger(name, config)
  } else {
    return new RendererLogger(name, config?.level)
  }
}

// Export types
export type Logger = MainLogger | RendererLogger
