import { ipcRenderer } from 'electron'
import { FuseResult } from 'fuse.js'
import { Collection, Family, Library, Page, Paged, WithoutId } from './types'

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
  'install.fonts'(ids: number[]): Promise<void> {
    return ipcRenderer.invoke('install.fonts', ids)
  },
  'uninstall.fonts'(ids: number[]): Promise<void> {
    return ipcRenderer.invoke('uninstall.fonts', ids)
  },
} as const

export default api

export type API = typeof api
export type APIKey = keyof API
