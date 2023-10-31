import { ipcRenderer } from 'electron'
import { Family, Library, Page, Paged, WithoutId } from './types'

const api = {
  'select.directory'(): Promise<string | undefined> {
    return ipcRenderer.invoke('select.directory')
  },
  'add.library'(library: WithoutId<Library>): Promise<void> {
    return ipcRenderer.invoke('add.library', library)
  },
  'get.libraries'(): Promise<Library[]> {
    return ipcRenderer.invoke('get.libraries')
  },
  'get.fonts'(libraryId: number, page: Page): Promise<Paged<Family>> {
    return ipcRenderer.invoke('get.fonts', libraryId, page)
  },
} as const

export default api

export type API = typeof api
export type APIKey = keyof API
