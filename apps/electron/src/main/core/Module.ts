import fs from 'node:fs/promises'
import { ipcMain, utilityProcess } from 'electron'
import TypedEmitter from 'typed-emitter'
import { Logger } from '@fontjam/electron-logger'
import { APIResponse } from '@shared/types/dto'
import { ConfigStore } from '~/config'
import ModuleEvents from '~/modules/ModuleEvents'
import { ModuleEventPayload, WrappedEventMap } from './EventBus'
import { ModuleEventData } from './types'

export type ModuleContext = {
  eventBus: TypedEmitter<WrappedEventMap<ModuleEvents>>
  config: ConfigStore
  log: Logger
}

export default abstract class Module {
  name: string
  #ctx: ModuleContext

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract api: Record<string, (...args: any[]) => any>

  abstract onDestroy(): Promise<void>
  protected abstract onInitialize(
    browserWindow: Electron.BrowserWindow,
  ): Promise<void>
  protected abstract getWorkerPath(): string

  constructor(name: string, ctx: ModuleContext) {
    this.name = name
    this.#ctx = ctx
  }

  get eventBus(): TypedEmitter<WrappedEventMap<ModuleEvents>> {
    return this.#ctx.eventBus
  }

  get config(): ConfigStore {
    return this.#ctx.config
  }

  get log(): Logger {
    return this.#ctx.log
  }

  async initialize(browserWindow: Electron.BrowserWindow) {
    await fs.mkdir(this.config.get('worker.path'), {
      recursive: true,
    })

    // Setup IPC handlers
    for (const name of Object.keys(this.api)) {
      ipcMain.handle(name, async (_, ...args) => this.api[name](...args))
    }

    await this.onInitialize(browserWindow)

    this.#setupEventBus(browserWindow)
  }

  #setupEventBus(mainWindow: Electron.BrowserWindow) {
    for (const event of Object.keys(
      this.eventBus.eventNames(),
    ) as (keyof ModuleEvents)[]) {
      this.eventBus.on(event, (payload: unknown) =>
        mainWindow.webContents.send(event, payload),
      )
    }
  }

  emit<K extends keyof ModuleEvents>(event: K, data: ModuleEventData<K>): void {
    const payload: ModuleEventPayload<K, ModuleEventData<K>> = {
      module: this.name,
      event,
      data,
      timestamp: Date.now(),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const method = this.eventBus.emit as any

    method(event, payload)
  }

  on<K extends keyof ModuleEvents>(event: K, handler: ModuleEvents[K]): void {
    const typedHandler = handler as (arg: ModuleEventData<K>) => void
    const handle = (payload: ModuleEventPayload<K, ModuleEventData<K>>) => {
      typedHandler(payload.data)
    }

    this.eventBus.on(event, handle as WrappedEventMap<ModuleEvents>[K])
  }

  async spawnWorker<InputData, OutputResult>(
    task: string,
    data: InputData,
  ): Promise<APIResponse<OutputResult>> {
    return new Promise((resolve, reject) => {
      const workerPath = this.getWorkerPath()

      this.log.debug(`Spawning worker for ${this.name}`, { task })

      const worker = utilityProcess.fork(workerPath, [], {
        execArgv: ['--loader', 'ts-node/esm'],
      })

      const timeout = setTimeout(() => {
        worker.kill()
        reject(new Error('Worker timeout'))
      }, 30000) // 30 second timeout

      worker.on('message', (message: unknown) => {
        clearTimeout(timeout)
        worker.kill()
        resolve(message as APIResponse<OutputResult>)
      })

      worker.on('error', (error) => {
        clearTimeout(timeout)
        worker.kill()
        reject(error)
      })

      // Send task to worker
      worker.postMessage({ task, data })
    })
  }
}
