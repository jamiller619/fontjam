import fs from 'node:fs/promises'
import { ipcMain, utilityProcess } from 'electron'
import TypedEventEmitter, { EventMap } from 'typed-emitter'
import { Logger } from '@fontjam/electron-logger'
import { APIResponse } from '@shared/types/dto'
import { ConfigStore } from '~/config'
import { Repository } from '~/db'
import ModuleEvents from '~/modules/ModuleEvents'
import { ModuleContext, ModuleEventPayload, WrappedEventMap } from './types'

export default abstract class Module<E extends EventMap = ModuleEvents> {
  name: string
  #ctx: ModuleContext<E>

  abstract repository: Repository

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  abstract api: Record<string, (...args: any[]) => any>
  protected abstract getWorkerPath(): string

  abstract destroy(): Promise<void>

  constructor(name: string, ctx: ModuleContext<E>) {
    this.name = name
    this.#ctx = ctx
  }

  get eventBus(): TypedEventEmitter<WrappedEventMap<E>> {
    return this.#ctx.eventBus
  }

  get config(): ConfigStore {
    return this.#ctx.config
  }

  get log(): Logger {
    return this.#ctx.log
  }

  getRepository(): Repository {
    return this.repository
  }

  async initialize(mainWindow: Electron.BrowserWindow) {
    await fs.mkdir(this.config.get('worker.path'), {
      recursive: true,
    })

    this.setupIPC()
    this.setupEventBus(mainWindow)

    await this.onInitialize()
  }

  abstract onInitialize(): Promise<void>

  setupIPC() {
    for (const name of Object.keys(this.api)) {
      ipcMain.handle(name, async (_, ...args) => this.api[name](...args))
    }
  }

  setupEventBus(mainWindow?: Electron.BrowserWindow) {
    for (const event of Object.keys(this.eventBus.eventNames())) {
      this.eventBus.on(
        event,
        (payload) => mainWindow?.webContents.send(event, payload),
      )
    }
  }

  emit<K extends keyof E>(event: K, data: Parameters<E[K]>[0]): void {
    const payload: ModuleEventPayload<K, Parameters<E[K]>[0]> = {
      module: this.name,
      event,
      data,
      timestamp: Date.now(),
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const method = this.eventBus.emit as any

    method(event, payload)
  }

  on<K extends keyof E>(
    event: K,
    handler: (payload: Parameters<E[K]>[0]) => void,
  ): void {
    this.eventBus.on(event, (payload) => {
      handler(payload.data)
    })
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
