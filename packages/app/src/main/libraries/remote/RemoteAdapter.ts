import { Library } from '@shared/types'
import { LibraryRepository } from '~/db'
import CommonAdapter from '~/libraries/CommonAdapter'
import LibraryAdapter from '~/libraries/LibraryAdapter'
import { remote as defaultRemoteLibraries } from '~/libraries/defaultLibraries.json'

export default class RemoteAdapter
  extends CommonAdapter
  implements LibraryAdapter
{
  matches(library: Library) {
    return library.type === 'remote'
  }

  override async init() {
    await super.init('remote')
  }

  async initDefaults() {
    for await (const remote of defaultRemoteLibraries) {
      await LibraryRepository.create({
        icon: remote.icon,
        isEditable: remote.isEditable as 0 | 1,
        name: remote.name,
        type: 'remote',
        path: remote!.path!,
      })
    }
  }
}
