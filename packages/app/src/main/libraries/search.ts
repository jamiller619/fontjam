import Fuse, { IFuseOptions } from 'fuse.js'
import logger from 'logger'
import { FontFamily, LibraryType } from '@shared/types'
import { FontRepository, LibraryRepository } from '~/db'

const log = logger('search.index')

type Options = IFuseOptions<FontFamily> & {
  keys: (keyof FontFamily)[]
}

const searchIndex: Record<number, Fuse<FontFamily>> = {}
const searchOptions: Options = {
  keys: ['name'],
  threshold: 0.3,
}

function index(libraryId: number) {
  const fonts: FontFamily[] = []

  return new Promise<Fuse<FontFamily>>((resolve, reject) => {
    const stream = FontRepository.streamFamilies(libraryId)

    stream.on('data', (font) => fonts.push(font))

    stream.on('end', () => resolve(new Fuse(fonts, searchOptions)))
    stream.on('error', reject)
  })
}

export async function buildIndex(type: LibraryType) {
  const libraries = await LibraryRepository.getAllOfType(type)

  for await (const library of libraries) {
    log.info(`${library.name}: Building search index...`)

    searchIndex[library.id] = await index(library.id)

    log.info(`${library.name}: Search index complete`)
  }
}

export default function search(libraryId: number, query: string) {
  if (searchIndex[libraryId] == null) {
    throw new Error(`No index found for library "${libraryId}"`)
  }

  return searchIndex[libraryId].search(query).map((r) => r.item)
}
