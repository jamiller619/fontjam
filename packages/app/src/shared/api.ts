import { ipcRenderer } from 'electron'
import { FuseResult } from 'fuse.js'
import { FontFamily, Library, OptionalId, Page, Paged } from './types'

export type WindowControlAction = 'minimize' | 'maximize.toggle' | 'close'

type Stats = {
  families: number
  fonts: number
}

type APIEvent = {
  'startup.complete': (ms: number) => unknown
  'library.loaded': (library: Library) => unknown
}

const api = {
  on<T extends keyof APIEvent>(event: T, handler: APIEvent[T]) {
    //@ts-ignore: this works
    ipcRenderer.on(event, (_, ...args: never[]) => handler(...args))
  },
  'choose.directory'(): Promise<string | undefined> {
    return ipcRenderer.invoke('choose.directory')
  },
  'create.library'(data: OptionalId<Library>): Promise<void> {
    return ipcRenderer.invoke('create.library', data)
  },
  'get.libraries'(): Promise<Library[]> {
    return ipcRenderer.invoke('get.libraries')
  },
  'get.families'(
    libraryId: number,
    page: Page
  ): Promise<Paged<FontFamily> | undefined> {
    return ipcRenderer.invoke('get.families', libraryId, page)
  },
  'get.family'(familyId: number): Promise<FontFamily | undefined> {
    return ipcRenderer.invoke('get.family', familyId)
  },
  'search.fonts'(
    libraryId: number,
    query: string
  ): Promise<FuseResult<FontFamily>[]> {
    return ipcRenderer.invoke('search.fonts', libraryId, query)
  },
  'get.stats'(libraryId: number): Promise<Stats | undefined> {
    return ipcRenderer.invoke('get.stats', libraryId)
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
