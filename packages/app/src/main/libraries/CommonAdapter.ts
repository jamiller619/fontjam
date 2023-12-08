import { FontFamily, Library, LibraryType, Page, Sort } from '@shared/types'
import { FontRepository } from '~/db'
import LibraryAdapter from './LibraryAdapter'
import search, { buildIndex } from './search'

export default class CommonAdapter
  implements Pick<LibraryAdapter, 'getFamilies' | 'search' | 'initLibrary'>
{
  async init(type: LibraryType) {
    await buildIndex(type)
  }

  initLibrary(_: Library) {
    return Promise.resolve()
  }

  async getFamilies(library: Library, page: Page, sort: Sort<FontFamily>) {
    return FontRepository.getFamilies(library.id, page, sort)
  }

  async search(libraryId: number, query: string) {
    return search(libraryId, query)
  }
}
