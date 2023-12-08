import { FontFamily, Library, Page, Paged, Sort } from '@shared/types'
import { FontRepository, LibraryRepository } from '~/db'
import CommonAdapter from '~/libraries/CommonAdapter'
import LibraryAdapter from '~/libraries/LibraryAdapter'
import { collection as defaultCollections } from '~/libraries/defaultLibraries.json'
import * as views from './views'

type CollectionType = 'view' | 'table'

function resolveViewName(libraryPath: string) {
  return libraryPath.split('view://').filter(Boolean).at(0)
}

function resolveCollectionType(collectionPath: string): CollectionType {
  if (collectionPath.startsWith('view://')) {
    return 'view'
  }

  return 'table'
}

async function initView(viewPath: string) {
  const view = resolveViewName(viewPath)

  if (!view || !Object.hasOwn(views, view)) {
    throw new Error(`Unable to initialize view for "${viewPath}"`)
  }

  const sql = views[view as keyof typeof views]

  await LibraryRepository.exec(sql)
}

async function resolvePath(collectionPath: string) {
  const type = resolveCollectionType(collectionPath)

  if (type === 'view') {
    await initView(collectionPath)

    return collectionPath
  }

  return collectionPath
}

const defaultFamilies = {
  index: 0,
  length: 0,
  records: [],
  total: 0,
} as Paged<FontFamily>

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

  override async getFamilies(
    library: Library,
    page: Page,
    sort: Sort<FontFamily>
  ) {
    const type = resolveCollectionType(library.path)

    if (type === 'view') {
      const view = resolveViewName(library.path)

      if (view) {
        return FontRepository.executeView(view, page, sort)
      }
    } else {
      return super.getFamilies(library, page, sort)
    }

    return defaultFamilies
  }

  async initDefaults() {
    for await (const collection of defaultCollections) {
      await LibraryRepository.create({
        icon: collection.icon,
        isEditable: collection.isEditable as 0 | 1,
        name: collection.name,
        type: 'collection',
        path: await resolvePath(collection.path),
      })
    }
  }
}
