import { utilityProcess } from 'electron'
import logger from 'logger'

const decoder = new TextDecoder()

function toLines(data: Uint8Array) {
  const decoded = decoder.decode(data)

  return decoded
    .replaceAll('\r', '')
    .split('\n')
    .filter((s) => typeof s === 'string' && s.trim() !== '')
}

function createLogHandler(onEachLineCallback: (msgs: string[]) => void) {
  return function handleLogMessage(arg: Uint8Array) {
    onEachLineCallback(toLines(arg))
  }
}

// const infoLogger = (msg: string) => log.info(msg)
// const errLogger = (msg: string) => log.error(msg, new
// Error(msg))

export default function fork(
  path: string,
  serviceName: string,
  ...args: string[]
) {
  const log = logger(`utilityProcess.${serviceName}`)

  const infoLogger = (msgs: string[]) => log.info(msgs.join('\n'))
  const errLogger = (msgs: string[]) =>
    log.error(msgs.join('\n'), new Error(msgs.join(' ')))

  const handleStdOut = createLogHandler(infoLogger)
  const handleStdErr = createLogHandler(errLogger)

  const proc = utilityProcess.fork(path, args, {
    stdio: 'pipe',
    serviceName,
  })

  return new Promise<void>((resolve) => {
    proc.stdout?.on('data', handleStdOut)
    proc.stderr?.on('data', handleStdErr)

    proc.once('exit', () => {
      proc.stdout?.off('data', handleStdOut)
      proc.stderr?.off('data', handleStdErr)

      resolve()
    })
  })
}
