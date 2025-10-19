import { EventEmitter } from 'node:events'
import TypedEventEmitter, { EventMap } from 'typed-emitter'
import { Logger, createLogger } from '@fontjam/electron-logger'
import { Config } from '@shared/config'
import { ConfigStore } from '~/config'
import MainWindow from './MainWindow'
import Module from './Module'

/**
 * Application Core
 * Manages module lifecycle and orchestrates communication
 */
export default class Application {
  config: ConfigStore
  log = createLogger('main') as Logger
  window: MainWindow

  #modules = new Map<string, Module>()
  #eventBus = new EventEmitter() as TypedEventEmitter<EventMap>
  #initialized = false

  getModuleContext() {
    return {
      eventBus: this.#eventBus,
      config: this.config,
      log: this.log,
    }
  }

  constructor(config: Config) {
    // Increase listener limit for event bus
    this.#eventBus.setMaxListeners(100)
    this.config = new ConfigStore({
      defaults: config,
    })

    this.window = new MainWindow(this.config, this.log)
  }

  /**
   * Initialize the application and all modules
   */
  async initialize(): Promise<void> {
    if (this.#initialized) {
      throw new Error('Application is already initialized')
    }

    this.log.info('Initializing application...')

    // Initialize all registered modules
    for (const [name, module] of this.#modules) {
      try {
        this.log.info(`Initializing module: ${name}`)

        await module.initialize(this.window)
      } catch (error) {
        this.log.error(`Failed to initialize module ${name}`, error)
        throw error
      }
    }

    await this.window.show()

    this.#initialized = true
    this.log.info('Application initialized successfully')
  }

  /**
   * Register a module with the application
   */
  registerModule(module: Module): void {
    if (this.#initialized) {
      throw new Error('Cannot register modules after initialization')
    }

    if (this.#modules.has(module.name)) {
      throw new Error(`Module ${module.name} is already registered`)
    }

    this.#modules.set(module.name, module)
    this.log.info(`Module registered: ${module.name}`)
  }

  /**
   * Get a module by name
   */
  getModule(name: string) {
    const module = this.#modules.get(name)

    if (!module) {
      throw new Error(`Module ${name} not found`)
    }

    return module
  }

  /**
   * Get a module's API
   */
  getModuleAPI<T>(moduleName: string): T {
    const module = this.getModule(moduleName)

    return module.api as T
  }

  /**
   * Check if a module is registered
   */
  hasModule(name: string): boolean {
    return this.#modules.has(name)
  }

  /**
   * Get all registered module names
   */
  getModuleNames(): string[] {
    return Array.from(this.#modules.keys())
  }

  /**
   * Shutdown the application
   */
  async shutdown(): Promise<void> {
    this.log.info('Shutting down application...')

    // Destroy all modules in reverse order
    const moduleNames = Array.from(this.#modules.keys()).reverse()

    for (const name of moduleNames) {
      try {
        const module = this.#modules.get(name)

        if (module) {
          this.log.info(`Destroying module: ${name}`)

          await module.destroy()
        } else {
          this.log.warn(`Module ${name} not found`)
        }
      } catch (error) {
        this.log.error(`Failed to destroy module ${name}`, error)
      }
    }

    this.#modules.clear()
    this.#eventBus.removeAllListeners()
    this.#initialized = false

    this.log.info('Application shutdown complete')
  }
}
