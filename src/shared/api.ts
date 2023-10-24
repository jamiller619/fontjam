import { ipcRenderer } from 'electron'
import { FontFile } from './types'

const invoke = <R, P>(channel: APIKey, params?: P) => {
  return ipcRenderer.invoke(channel, params) as Promise<R>
}

const api = {
  'get.font'(name: string): Promise<FontFile> {
    return invoke('get.font', name)
  },
} as const

export default api

export type API = typeof api
export type APIKey = keyof API
