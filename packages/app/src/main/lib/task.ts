import fastq from 'fastq'
import logger from 'logger'

const log = logger('task.service')

type Task = (...args: never[]) => Promise<void> | void
type WorkerParams<T extends Task> = {
  args: Parameters<T>
}

function createWorker<T extends Task>(name: string, task: T) {
  return async function worker({ args }: WorkerParams<T>) {
    log.info(`Running task "${name}"`)

    try {
      await task(...args)
    } catch (err) {
      log.error(`Task "${name}" ended in error`, err as Error)
    }
  }
}

export default {
  createQueue<T extends Task>(name: string, task: T) {
    const worker = createWorker<T>(name, task)
    const taskQueue = fastq.promise<unknown, WorkerParams<T>, void>(worker, 1)

    return async function queue(...args: Parameters<T>) {
      await taskQueue.push({
        args,
      })
    }
  },
}
