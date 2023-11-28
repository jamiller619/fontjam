import EventEmitter from 'node:events'
import logger from 'logger'
import { handle } from '@shared/ipc'
import { FontFamily, Library, Page, Paged } from '@shared/types'
import { LibraryRepository } from '~/db'
import CollectionAdapter from './collection/CollectionAdapter'
import LocalAdapter from './local/LocalAdapter'
import GoogleFontsAdapter from './remote/GoogleFontsAdapter'
import RemoteAdapter from './remote/RemoteAdapter'

export default interface LibraryAdapter extends EventEmitter {
  matches: (library: Library) => boolean
  getFamilies: (library: Library, page: Page) => Promise<Paged<FontFamily>>
  search: (libraryId: number, query: string) => Promise<FontFamily[]>
  initLibrary: (library: Library) => Promise<void>
  initDefaults: () => Promise<void>
  init: () => Promise<void>
}

const log = logger('library.adapter')

const adapters: LibraryAdapter[] = [
  new LocalAdapter(),
  new CollectionAdapter(),
  new GoogleFontsAdapter(),
  new RemoteAdapter(),
]

function resolveAdapter(library: Library) {
  return adapters.find((a) => a.matches(library))
}

type SQLError = Error & {
  code: string
  errno: number
}

export async function init() {
  for await (const adapter of adapters) {
    try {
      await adapter.initDefaults()
    } catch (err) {
      if ((err as SQLError).code !== 'SQLITE_CONSTRAINT') {
        log.error(`Unable to intialize defaults!`, err as Error)
      }
    }
  }

  const libraries = await LibraryRepository.getAll()

  for await (const library of libraries) {
    try {
      const adapter = resolveAdapter(library)

      await adapter?.initLibrary(library)
    } catch (err) {
      log.error(`Unable to initialize library "${library.name}"`, err as Error)
    }
  }

  handle('get.families', async (libraryId, page) => {
    if (libraryId == null) {
      log.warn(`"get.families":"id" cannot be null`)

      return undefined
    }

    const library = await LibraryRepository.byId(libraryId)

    if (library == null) {
      return undefined
    }

    const adapter = resolveAdapter(library)

    if (adapter) {
      return adapter.getFamilies(library, page)
    }

    log.warn(`No adapter found for library "${library.name}"`)

    return undefined
  })
}
