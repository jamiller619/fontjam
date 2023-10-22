import { ipcMain } from 'electron'
import { API, APIKey } from '@shared/api'
import { Scanner } from '~/scanner'

const handle = <K extends APIKey, R>(
  channel: K,
  handler: (params: Parameters<API[K]>[0]) => R
) => {
  return ipcMain.handle(channel, (_, param) => handler(param))
}

export class IpcAPI {
  async start() {
    this.registerHandlers()
  }

  registerHandlers() {
    handle('scan.dir', () => new Scanner().scan())
  }
}
