import EventEmitter from 'node:events'
import TypedEmitter from 'typed-emitter'
import { Library, LibraryType, Page } from '@shared/types'
import { FontRepository } from '~/db'
import LibraryAdapter from './LibraryAdapter'
import search, { buildIndex } from './search'

type MessageEvent = {
  'library.loaded': (library: Library) => unknown
}

export default class CommonAdapter
  extends (EventEmitter as new () => TypedEmitter<MessageEvent>)
  implements Pick<LibraryAdapter, 'getFamilies' | 'search'>
{
  async init(type: LibraryType) {
    await buildIndex(type)
  }

  async getFamilies(library: Library, page: Page) {
    return FontRepository.getFamilies(library.id, page)
  }

  async search(libraryId: number, query: string) {
    return search(libraryId, query)
  }
}
