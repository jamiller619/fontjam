import { ipcRenderer } from 'electron'
import { FuseResult } from 'fuse.js'
import { FontFamily, Library } from './types/dto'
import { OptionalId, Page, Paged, Sort } from './types/utils'

export type WindowControlAction = 'minimize' | 'maximize.toggle' | 'close'

type Stats = {
  families: number
  fonts: number
}

export type APIEvent = {
  'startup.complete': (ms: number) => unknown
  'library.loaded': (library: Library) => unknown
}

const api = {
  on<T extends keyof APIEvent>(event: T, handler: APIEvent[T]) {
    // @ts-ignore: this works...
    ipcRenderer.on(event, (_, ...args) => handler(...args))
  },
  off<T extends keyof APIEvent>(event: T) {
    ipcRenderer.removeAllListeners(event)
  },
  'choose.directory'(): Promise<string | undefined> {
    return ipcRenderer.invoke('choose.directory')
  },
  'window.control'(action: WindowControlAction): Promise<void> {
    return ipcRenderer.invoke('window.control', action)
  },
  'create.library'(data: OptionalId<Library>): Promise<void> {
    return ipcRenderer.invoke('create.library', data)
  },
  'get.libraries'(): Promise<Library[]> {
    return ipcRenderer.invoke('get.libraries')
  },
  'get.stats'(libraryId: number): Promise<Stats | undefined> {
    return ipcRenderer.invoke('get.stats', libraryId)
  },
  'get.family'(id: number): Promise<FontFamily | undefined> {
    return ipcRenderer.invoke('get.family', id)
  },
  'get.families'(
    libraryId: number,
    page: Page,
    sort: Sort<FontFamily>,
  ): Promise<Paged<FontFamily> | undefined> {
    return ipcRenderer.invoke('get.families', libraryId, page, sort)
  },
  'search.fonts'(
    libraryId: number,
    query: string,
  ): Promise<FuseResult<FontFamily>[]> {
    return ipcRenderer.invoke('search.fonts', libraryId, query)
  },
  'add.fonts'(libraryId: number, ...fontIds: number[]): Promise<void> {
    return ipcRenderer.invoke('add.fonts', libraryId, ...fontIds)
  },
  'remove.fonts'(libraryId: number, ...fontIds: number[]): Promise<void> {
    return ipcRenderer.invoke('remove.fonts', libraryId, ...fontIds)
  },
  'install.fonts'(...filePaths: string[]): Promise<void> {
    return ipcRenderer.invoke('install.fonts', ...filePaths)
  },
  'uninstall.fonts'(...fontIds: number[]): Promise<void> {
    return ipcRenderer.invoke('uninstall.fonts', ...fontIds)
  },
} as const

export default api

export type API = typeof api
export type APIKey = keyof API
