import { ipcMain } from 'electron'
import { API, APIKey } from './api'

export function handle<K extends APIKey>(
  channel: K,
  handler: (...params: Parameters<API[K]>) => ReturnType<API[K]> | Error
) {
  ipcMain.removeHandler(channel)

  // @ts-ignore: this works
  ipcMain.handle(channel, (_, ...params) => handler(...params))
}
