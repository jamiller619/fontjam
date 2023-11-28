import fs from 'node:fs/promises'
import path from 'node:path'
import { Library } from '@shared/types'
import slugify from '@shared/utils/slugify'
import { paths } from '~/config'
import { LibraryRepository } from '~/db'
import CommonAdapter from '~/libraries/CommonAdapter'
import LibraryAdapter from '~/libraries/LibraryAdapter'
import { collection as defaultCollections } from '~/libraries/defaultLibraries.json'

async function resolvePath(collectionName: string) {
  const file = path.normalize(
    `${paths.data}/collections/${slugify(collectionName)}.json`
  )

  await fs.mkdir(path.dirname(file), {
    recursive: true,
  })

  return file
}

export default class CollectionAdapter
  extends CommonAdapter
  implements LibraryAdapter
{
  matches(library: Library) {
    return library.type === 'collection'
  }

  override async init() {
    await super.init('collection')
  }

  async initLibrary(library: Library) {
    this.emit('library.loaded', library)

    return Promise.resolve()
  }

  async initDefaults() {
    for await (const collection of defaultCollections) {
      await LibraryRepository.create({
        icon: collection.icon,
        isEditable: collection.isEditable as 0 | 1,
        name: collection.name,
        type: 'collection',
        path: await resolvePath(collection.name),
      })
    }
  }
}
