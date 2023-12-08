import { Transform } from 'node:stream'
import sql, { Sql, raw } from 'sql-template-tag'
import { Font, FontFamily, Library, Page, Sort } from '@shared/types'
import DatabaseStream from './DatabaseStream'
import Database from './Driver'
import filters, { createPagedResponse } from './filters'
import { mapFontFamilyJoinQuery } from './fonts.map'
import { mapLibrary } from './library.map'
import type { FontFamilyEntity } from './types'

export type FontFamilyJoinQueryRow = FontFamilyEntity &
  Omit<Font, 'id' | 'familyId' | 'createdAt' | 'fvar'> & {
    fontId: number
    fontCreatedAt: number
    fvar: string | null
  }

function fontFamilyJoinQuery(subQuery: Sql, table = 'families') {
  return sql`
    SELECT
      families.id,
      families.createdAt,
      families.name,
      families.tags,
      families.copyright,
      families.popularity,
      families.designer,
      families.license,
      families.version,
      fonts.id as fontId,
      fonts.createdAt as fontCreatedAt,
      fonts.fullName,
      fonts.path,
      fonts.postscriptName,
      fonts.style,
      fonts.weight
    FROM (
      SELECT *
      FROM ${raw(table)}
      ${subQuery}
    ) as families
    join fonts
    on families.id = fonts.familyId
  `
}

export default class ReadRepository {
  static async stream<T>(db: Database, query: Sql) {
    return new DatabaseStream<T>(query, db.getdb())
  }

  static async streamFamilies(db: Database, libraryId: number) {
    const query = sql`
      SELECT * FROM families
      WHERE libraryId = ${libraryId}
    `

    const stream = await this.stream<FontFamily>(db, query)

    return stream.pipe(
      new Transform({
        objectMode: true,
        transform: (data, _, cb) => cb(null, data),
      }),
    )
  }

  static async executeView<T>(
    db: Database,
    viewName: string,
    page: Page,
    sort: Sort<T>,
  ) {
    const pageQuery = sql`
      ${filters.sort(sort)}
      ${filters.page(page)}
    `

    const query = sql`
      ${fontFamilyJoinQuery(pageQuery, viewName)}
    `

    const countQuery = sql`
      SELECT COUNT(*) AS total
      FROM ${raw(viewName)}
    `

    const count = await db.query<{ total: number }>(countQuery)
    const records = await db.queryMany<FontFamilyJoinQueryRow>(query)
    const mapped = mapFontFamilyJoinQuery(...records)

    return createPagedResponse(count?.total ?? 0, page.index, mapped)
  }

  static getFont(db: Database, fontId: number) {
    const query = sql`
      SELECT * FROM fonts
      WHERE id = ${fontId}
    `

    return db.query<Font>(query)
  }

  static async getFamily(db: Database, familyId: number) {
    const query = fontFamilyJoinQuery(sql`
      WHERE id = ${familyId}
    `)

    const data = await db.queryMany<FontFamilyJoinQueryRow>(query)

    if (data) {
      return mapFontFamilyJoinQuery(...data).at(0)
    }
  }

  static async getFamilies(
    db: Database,
    libraryId: number,
    page: Page,
    sort: Sort<FontFamily>,
  ) {
    const newSort = {
      col: `families.${sort.col}`,
      dir: sort.dir,
    }

    const query = fontFamilyJoinQuery(sql`
      WHERE libraryId = ${libraryId}
      ${filters.sort(newSort)}
      ${filters.page(page)}
    `)

    const data = await db.queryMany<FontFamilyJoinQueryRow>(query)

    const total = await this.countFamilies(db, libraryId)
    const records = mapFontFamilyJoinQuery(...data)

    return createPagedResponse(total, page.index, records)
  }

  static async getLibraries(db: Database) {
    const records = await db.queryMany<Library>(sql`SELECT * FROM libraries`)

    return records.map(mapLibrary)
  }

  static async getLibrary(db: Database, id: number) {
    const query = sql`
      SELECT * FROM libraries
      WHERE id = ${id}
    `

    const data = await db.query<Library>(query)

    if (data) return mapLibrary(data)
  }

  static async countFonts(db: Database, libraryId: number) {
    const query = sql`
      SELECT COUNT(*) AS total
      FROM fonts
      JOIN families on families.id = fonts.familyId
      JOIN libraries on libraries.id = families.libraryId
      WHERE libraries.id = ${libraryId}
    `

    const result = await db.query<{ total: number }>(query)

    return result?.total ?? 0
  }

  static async countFamilies(db: Database, libraryId: number) {
    const query = sql`
      SELECT COUNT(*) AS total
      FROM families
      WHERE libraryId = ${libraryId}
    `

    const result = await db.query<{ total: number }>(query)

    return result?.total ?? 0
  }

  static async getLibraryStats(db: Database, libraryId?: number) {
    if (!libraryId) {
      return {
        families: 0,
        fonts: 0,
      }
    }

    return {
      families: await this.countFamilies(db, libraryId),
      fonts: await this.countFonts(db, libraryId),
    }
  }
}
