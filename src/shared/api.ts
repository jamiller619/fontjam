import { ipcRenderer } from 'electron'

const invoke = <R, P>(channel: APIKey, params?: P) => {
  return ipcRenderer.invoke(channel, params) as Promise<R>
}

const api = {
  'scan.dir'(dir?: string) {
    return invoke('scan.dir', dir)
  },
} as const

export default api

export type API = typeof api
export type APIKey = keyof API
