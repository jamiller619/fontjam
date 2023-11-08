import { ipcRenderer } from 'electron'
import { FuseResult } from 'fuse.js'
import {
  CatalogTypeName,
  Collection,
  Family,
  Library,
  Page,
  Paged,
  WithoutId,
} from './types'

export type WindowControlAction = 'minimize' | 'maximize.toggle' | 'close'

type Stats = {
  families: number
  fonts: number
}

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
  'get.collections'(): Promise<Collection[]> {
    return ipcRenderer.invoke('get.collections')
  },
  'get.families'(libraryId: number, page: Page): Promise<Paged<Family>> {
    return ipcRenderer.invoke('get.families', libraryId, page)
  },
  'get.family'(libraryId: number, familyName: string): Promise<Family> {
    return ipcRenderer.invoke('get.family', libraryId, familyName)
  },
  'search.fonts'(
    libraryId: number,
    query: string
  ): Promise<FuseResult<Family>[]> {
    return ipcRenderer.invoke('search.fonts', libraryId, query)
  },
  'get.stats'(id: number, type: CatalogTypeName): Promise<Stats | undefined> {
    return ipcRenderer.invoke('get.stats', id, type)
  },
  'install.fonts'(ids: number[]): Promise<void> {
    return ipcRenderer.invoke('install.fonts', ids)
  },
  'uninstall.fonts'(ids: number[]): Promise<void> {
    return ipcRenderer.invoke('uninstall.fonts', ids)
  },
  'window.control'(action: WindowControlAction): Promise<void> {
    return ipcRenderer.invoke('window.control', action)
  },
} as const

export default api

export type API = typeof api
export type APIKey = keyof API
