import type Fuse from 'fuse.js'
import { type IFuseOptions } from 'fuse.js'
import logger from 'logger'
import { Family } from '@shared/types'

const log = logger('lib.search')

const fuses: Record<number, Fuse<Family>> = {}

type Options = IFuseOptions<Family> & {
  keys: (keyof Family)[]
}

const options: Options = {
  keys: ['name'],
  threshold: 0.3,
}

async function initSearchIndex() {
  const { default: Fuse } = await import('fuse.js')
  const { FontRepository } = await import('~/fonts')

  return function createIndex(libraryId: number) {
    const fonts: Family[] = []

    return new Promise<Fuse<Family>>((resolve, reject) => {
      const stream = FontRepository.streamFamilies(libraryId)

      stream.on('data', (font) => fonts.push(font))

      stream.on('end', () => resolve(new Fuse(fonts, options)))
      stream.on('error', reject)
    })
  }
}

export default {
  async search(libraryId: number, query: string) {
    if (fuses[libraryId] == null) {
      throw new Error(`Library ${libraryId} has not been indexed`)
    }

    return fuses[libraryId].search(query)
  },

  async init() {
    const { CatalogRepository } = await import('~/catalog')
    const libraries = await CatalogRepository.getAllLibraries()
    const createIndex = await initSearchIndex()

    for await (const library of libraries) {
      log.info(`Building search index for library ${library.name}`)

      fuses[library.id] = await createIndex(library.id)

      log.info(`Done building search index for library ${library.name}`)
    }
  },
}
