import { FontFamily, Library } from '@shared/types'
import LibraryAdapter from '~/libraries/LibraryAdapter'
import * as GithubScanner from './GithubScanner'
import RemoteAdapter from './RemoteAdapter'

export default class GithubAdapter
  extends RemoteAdapter
  implements LibraryAdapter
{
  override async search(libraryId: number, query: string) {
    console.log(libraryId, query)
    return [] as FontFamily[]
  }

  override matches(library: Library) {
    return library.type === 'remote' && library.path.startsWith('github://')
  }

  override async initLibrary(library: Library) {
    await GithubScanner.scanRepo(library)

    this.emit('library.loaded', library)
  }
}
