import path from 'node:path'
import { Transform } from 'node:stream'
import { Family, FamilyFont, Font, Page, Paged } from '@shared/types'
import { CatalogRepository } from '~/catalog'
import { Repository, filters } from '~/db'
import TokenPath from '~/lib/TokenPath'
import { sql } from '~/lib/sqlite'

const schema = sql`
  id INTEGER PRIMARY KEY AUTOINCREMENT,
	libraryId INTEGER NOT NULL,
	family TEXT NOT NULL,
	fullName TEXT,
	postscriptName TEXT,
	style TEXT,
	path TEXT,
  isInstalled INTEGER DEFAULT 0,
	FOREIGN KEY(libraryId) REFERENCES libraries(id) ON DELETE CASCADE
`

const repo = new Repository<Font>('fonts', schema)

export const create = repo.insert.bind(repo)
export const findById = repo.findById.bind(repo)
export const update = repo.update.bind(repo)

function getFamilyQuery(libraryId: number, page?: Page) {
  const query = sql`
    SELECT
      group_concat(id) as ids,
      family,
      group_concat(path) as paths,
      group_concat(style) as styles,
      group_concat(postscriptName) as postscriptNames,
      group_concat(isInstalled) as isInstalled,
      group_concat(fullName) as fullNames
    FROM fonts
    WHERE libraryId = ${libraryId}
    GROUP BY family
  `

  if (page != null) {
    return sql`${query} ${filters.page(page)}`
  }

  return query
}

function mapFamily(libraryId: number) {
  return function map({
    ids,
    paths,
    family,
    styles,
    fullNames,
    postscriptNames,
    isInstalled,
  }: FamilyQueryResponse) {
    const fontIds = ids.split(',').filter(String).map(Number)
    const fonts = fontIds.map((id, i) => {
      const split = <T>(prop: string) => prop.split(',').at(i) as T
      const data: FamilyFont = {
        fullName: split(fullNames),
        id,
        isInstalled: split<0 | 1>(isInstalled),
        path: split(paths),
        postscriptName: split(postscriptNames),
        style: split(styles),
      }

      return data
    })

    const fontFamily: Family = {
      name: family,
      libraryId,
      fonts,
    }

    return fontFamily
  }
}

function sortFonts(a: Font, b: Font) {
  const na = a.fullName.toUpperCase()
  const nb = b.fullName.toUpperCase()

  if (na < nb) return -1
  if (na > nb) return 1

  return 0
}

function mapFontsToFamily(fonts: Font[]) {
  const family: Family = {
    name: fonts[0].family,
    libraryId: fonts[0].libraryId,
    fonts: fonts
      .toSorted(sortFonts)
      .map(({ fullName, id, isInstalled, path, postscriptName, style }) => ({
        fullName,
        id,
        isInstalled,
        path,
        postscriptName,
        style,
      })),
  }

  return family
}

type FamilyQueryResponse = {
  ids: string
  family: string
  styles: string
  paths: string
  postscriptNames: string
  isInstalled: string
  fullNames: string
}

export async function getFamilyByName(libraryId: number, familyName: string) {
  const query = sql`SELECT * FROM fonts WHERE family = "${familyName}" AND libraryId = ${libraryId}`
  const results = await repo.queryMany<Font>(query)

  return mapFontsToFamily(results)
}

export async function countFonts(libraryId: number) {
  const countFontsQuery = sql`
    SELECT COUNT(*) as total
    FROM fonts
    WHERE libraryId = ${libraryId}
  `

  const result = await repo.query<{ total: number }>(countFontsQuery)

  return result.total
}

export async function countFamilies(libraryId: number) {
  const countFamiliesQuery = sql`
    SELECT COUNT(*) as total
    FROM fonts
    WHERE libraryId = ${libraryId}
    GROUP BY family
  `

  const result = await repo.queryMany<{ total: number }>(countFamiliesQuery)

  return result.length
}

export async function getFamilies(libraryId: number, page: Page) {
  const query = getFamilyQuery(libraryId, page)
  const total = await countFamilies(libraryId)
  const records = await repo.queryMany<FamilyQueryResponse>(query)

  const response: Paged<Family> = {
    index: page.index,
    length: records.length,
    records: records.map(mapFamily(libraryId)),
    total,
  }

  return response
}

export function streamFamilies(libraryId: number) {
  const query = getFamilyQuery(libraryId)
  const map = mapFamily(libraryId)

  const stream = repo.stream<FamilyQueryResponse>(query)

  return stream.pipe(
    new Transform({
      objectMode: true,
      transform: (data, _, cb) => cb(null, map(data)),
    })
  )
}

/**
 * Checks if a font exists in a library in the database.
 * @param libraryId The library id
 * @param path The relative path from the library root
 * @returns A boolean indicating whether the font exists in
 * the library in the database.
 */
export async function exists(libraryId: number, path: string) {
  const matches = await repo.findAll('path', `"${path}"`)
  const match = matches.find((m) => m?.libraryId === libraryId)

  return match != null
}

export async function getFilePath(id: number) {
  const font = await findById(id)

  if (!font) {
    throw new Error(`No font found with id ${id}`)
  }

  const library = await CatalogRepository.findById(font.libraryId)

  if (library == null) {
    throw new Error(`No library found with id ${font.libraryId}`)
  }

  const resolvedLibraryPath = TokenPath.resolve(library.path)

  return path.join(resolvedLibraryPath, font.path)
}
