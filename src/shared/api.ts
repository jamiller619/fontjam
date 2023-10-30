import { ipcRenderer } from 'electron'
import { Font, Library, Page, Paged, Sort } from './types'

const api = {
  'select.directory'() {
    return ipcRenderer.invoke('select.directory') as Promise<string | undefined>
  },
  'add.library'(library: Pick<Library, 'name' | 'path'>) {
    return ipcRenderer.invoke('add.library', library)
  },
  'get.libraries'() {
    return ipcRenderer.invoke('get.libraries') as Promise<Paged<Library>>
  },
  'get.fonts'(libraryId: number, page: Page, sort: Sort<Font>) {
    return ipcRenderer.invoke('get.fonts', libraryId, page, sort)
  },
} as const

export default api

export type API = typeof api
export type APIKey = keyof API
