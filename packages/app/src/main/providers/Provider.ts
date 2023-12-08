import logger from 'logger'
import { Library } from '@shared/types'
import fork from '~/lib/fork'

const log = logger('provider')

export interface IProvider {
  match(library: Library): boolean
  init(library: Library): Promise<void>
}

export default abstract class Provider {
  lastRun: number | null = null
  serviceName: string
  workerPath: string

  constructor(workerPath: string, serviceName: string) {
    this.workerPath = workerPath
    this.serviceName = serviceName
  }

  async initWorker(...args: string[]) {
    log.info(`Initializing worker "${this.serviceName}"`)

    try {
      await fork(this.workerPath, this.serviceName, ...args)

      log.info(`"${this.serviceName}" completed successfully`)
    } catch (err) {
      log.error(`"${this.serviceName}" ended in error`, err as Error)
    }
  }
}
