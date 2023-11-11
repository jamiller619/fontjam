import EventEmitter from 'node:events'
import TypedEmitter from 'typed-emitter'
import {
  Catalog,
  CatalogRecord,
  CatalogTypeName,
  Collection,
  Library,
} from '@shared/types'
import { Repository } from '~/db'
import { FontRepository } from '~/fonts'
import TokenPath from '~/lib/TokenPath'
import { sql } from '~/lib/sqlite'

type CatalogFont = {
  id: number
  catalogId: number
  fontId: number
}

const CatalogSchema = sql`
  id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	createdAt INTEGER NOT NULL,
	isEditable INTEGER DEFAULT 1,
	icon TEXT,
  path TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL
`

const CatalogFontsSchema = sql`
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  catalogId INTEGER NOT NULL,
  fontId INTEGER NOT NULL,
  FOREIGN KEY (catalogId) REFERENCES catalog(id) ON DELETE CASCADE,
  FOREIGN KEY (fontId) REFERENCES fonts(id) ON DELETE CASCADE
`

const CatalogRepository = new Repository<Catalog>('catalog', CatalogSchema)
const CatalogFontsRepository = new Repository<CatalogFont>(
  'catalog_fonts',
  CatalogFontsSchema
)

export const ready = CatalogRepository.ready.then(
  () => CatalogFontsRepository.ready
)

export const findById = CatalogRepository.findById.bind(CatalogRepository)

type MessageEvents = {
  'library.created'(library: Library): Promise<void> | void
  'collection.created'(collection: Collection): Promise<void> | void
}

const emitter = new EventEmitter() as TypedEmitter<MessageEvents>

export const on = emitter.on.bind(emitter)
export const off = emitter.off.bind(emitter)
export const once = emitter.once.bind(emitter)
export const emit = emitter.emit.bind(emitter)

function mapCatalog<T extends CatalogTypeName>({
  type: _,
  ...data
}: Catalog): CatalogRecord<T> {
  return {
    ...data,
    path: TokenPath.resolve(data.path),
  }
}

async function getAll<T extends CatalogTypeName>(type: T) {
  const records = await CatalogRepository.queryMany(
    sql`SELECT * FROM catalog WHERE type = "${type}"`
  )

  const data = records.map<CatalogRecord<T>>(mapCatalog)

  return data
}

export const getAllLibraries = () => getAll('library')
export const getAllCollections = () => getAll('collection')

async function create<T extends CatalogTypeName>(
  type: T,
  data: Omit<CatalogRecord<T>, 'createdAt' | 'type' | 'id'>
): Promise<CatalogRecord<T>> {
  const record = await CatalogRepository.insert({
    ...data,
    createdAt: Date.now(),
    type,
  })

  const mapped = mapCatalog(record)
  const event = `${type}.created` as keyof MessageEvents

  emitter.emit(event, mapped)

  return mapped
}

export async function createCollection(
  data: Omit<Collection, 'createdAt' | 'type' | 'id'>
) {
  await create('collection', data)
}

export async function createLibrary(
  data: Omit<Library, 'createdAt' | 'type' | 'id'>
) {
  await create('library', data)
}

async function getLibraryStats(id: number) {
  const families = await FontRepository.countFamilies(id)
  const fonts = await FontRepository.countFonts(id)

  return {
    families,
    fonts,
  }
}

export async function getCatalogStats(id: number, type: CatalogTypeName) {
  if (type == 'library') {
    return getLibraryStats(id)
  }
}

// export async function addFontsToCollection(
//   collectionId: number,
//   fontIds: number[]
// ) {
//   const fonts = fontIds.map((fontId) => ({
//     catalogId: collectionId,
//     fontId,
//   }))

//   await CatalogFontsRepository.insertMany(fonts)
// }

// export async function removeFontsFromCollection(
//   collectionId: number,
//   fontIds: number[]
// ) {
//   await CatalogFontsRepository.query(
//     sql`DELETE FROM collections_fonts WHERE collectionId = ${collectionId} AND fontId IN (${fontIds})`
//   )
// }
