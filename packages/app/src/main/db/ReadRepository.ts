import { Transform } from 'node:stream'
import sql, { Sql, raw } from 'sql-template-tag'
import type { Driver } from '@fontjam/sqleasy'
import { Font, FontFamily, Library } from '@shared/types/dto'
import { Page, Sort } from '@shared/types/utils'
import DatabaseStream from './DatabaseStream'
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
      families.postscriptFamilyName,
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
      fonts.postscriptFontName,
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
  static async stream<T>(driver: Driver, query: Sql) {
    return new DatabaseStream<T>(query, driver.db)
  }

  static async streamFamilies(db: Driver, libraryId: number) {
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
    driver: Driver,
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

    const count = await driver.query<{ total: number }>(countQuery)
    const records = await driver.queryMany<FontFamilyJoinQueryRow>(query)
    const mapped = mapFontFamilyJoinQuery(...records)

    return createPagedResponse(count?.total ?? 0, page.index, mapped)
  }

  static getFont(db: Driver, fontId: number) {
    const query = sql`
      SELECT * FROM fonts
      WHERE id = ${fontId}
    `

    return db.query<Font>(query)
  }

  static async getFamily(db: Driver, familyId: number) {
    const query = fontFamilyJoinQuery(sql`
      WHERE id = ${familyId}
    `)

    const data = await db.queryMany<FontFamilyJoinQueryRow>(query)

    if (data) {
      return mapFontFamilyJoinQuery(...data).at(0)
    }
  }

  static async getFamilies(
    db: Driver,
    libraryId: number,
    page: Page,
    sort: Sort<FontFamily>,
  ) {
    if (libraryId == null) {
      return
    }

    const newSort = {
      col: `families.${sort.col}`,
      dir: sort.dir,
    }

    const query = fontFamilyJoinQuery(
      sql`
      WHERE libraryId = ${raw(String(libraryId))}
      ${filters.sort(newSort)}
      ${filters.page(page)}
    `,
    )

    const data = await db.queryMany<FontFamilyJoinQueryRow>(query)

    const total = await this.countFamilies(db, libraryId)
    const records = mapFontFamilyJoinQuery(...data).sort((a, b) => {
      const acol = a[sort.col]
      const bcol = b[sort.col]

      if (!acol || !bcol) {
        return 0
      }

      if (acol < bcol) {
        return sort.dir === 'asc' ? -1 : 1
      }

      return sort.dir === 'asc' ? 1 : -1
    })

    return createPagedResponse(total, page.index, records)
  }

  static async getLibraries(db: Driver) {
    const records = await db.queryMany<Library>(sql`SELECT * FROM libraries`)

    return records.map(mapLibrary)
  }

  static async getLibrary(db: Driver, id: number) {
    const query = sql`
      SELECT * FROM libraries
      WHERE id = ${id}
    `

    const data = await db.query<Library>(query)

    if (data) return mapLibrary(data)
  }

  static async countFonts(db: Driver, libraryId: number) {
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

  static async countFamilies(db: Driver, libraryId: number) {
    const query = sql`
      SELECT COUNT(*) AS total
      FROM families
      WHERE libraryId = ${libraryId}
    `

    const result = await db.query<{ total: number }>(query)

    return result?.total ?? 0
  }

  static async getLibraryStats(db: Driver, libraryId?: number) {
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
