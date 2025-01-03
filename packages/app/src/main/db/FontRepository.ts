import fs from 'node:fs/promises'
import { Transform } from 'node:stream'
import logger from 'logger'
import sql, { Sql, bulk, raw } from 'sql-template-tag'
import { BaseFont, Font, FontFamily } from '@shared/types/dto'
import { Page, Sort } from '@shared/types/utils'
import { toUnixTime } from '@shared/utils/datetime'
import groupBy from '@shared/utils/groupBy'
import { titleCase } from '@shared/utils/string'
import data from '~/data/systemDirectories.json'
import Repository from './Repository'
import filters, { createPagedResponse } from './filters'

const log = logger('font.repository')

type TableMap = {
  fonts: Font
  families: Omit<FontFamily, 'fonts' | 'tags'> & {
    tags: string | null
  }
}

type FontFamilyJoin = TableMap['families'] &
  Omit<Font, 'id' | 'familyId' | 'createdAt'> & {
    fontId: number
    fontCreatedAt: number
  }

const fontFamilyJoinQuery = (subQuery: Sql, table = 'families') => sql`
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

const styleRanks = ['regular', 'medium', 'demi', 'mono', 'book', 'icons']

function scoreWeight(weight: number | null) {
  if (weight == null) {
    return 0
  }

  return 1000 - Math.abs(400 - weight) / 1000
}

function scoreStyle(style: string) {
  const lower = style.toLowerCase()
  const idx = styleRanks.toReversed().findIndex((s) => lower.includes(s))
  const rank = (idx + 1) / styleRanks.length

  return rank
}

function generateSortRank(font: Font) {
  const weight = scoreWeight(font.weight)
  const style = scoreStyle(font.style)

  return weight / 2 + style / 2
}

function sortFonts(a: Font, b: Font) {
  const sa = generateSortRank(a)
  const sb = generateSortRank(b)

  return sb - sa
}

function mapFontFamilyJoin(ref: FontFamilyJoin) {
  return function map(row: FontFamilyJoin) {
    const data: Font = {
      createdAt: row.fontCreatedAt,
      familyId: ref.id,
      fullName: row.fullName,
      id: row.fontId,
      path: row.path,
      postscriptFontName: row.postscriptFontName,
      style: titleCase(row.style),
      weight: row.weight,
      fileCreatedAt: row.fileCreatedAt,
      fileSize: row.fileSize,
      fvar: row.fvar,
    }

    return data
  }
}

function mapFontFamilyJoins(...fontFamilies: FontFamilyJoin[]) {
  const families = groupBy(fontFamilies, (d) => String(d.id))

  return Object.values(families).map((rows) => {
    const ref = rows.at(0)!
    const mapFont = mapFontFamilyJoin(ref)

    const family: FontFamily = {
      id: ref.id,
      copyright: ref.copyright,
      createdAt: ref.createdAt,
      libraryId: ref.libraryId,
      name: ref.name,
      popularity: ref.popularity,
      tags: ref.tags ? JSON.parse(ref.tags) : null,
      designer: ref.designer,
      license: ref.license,
      version: ref.version,
      postscriptFamilyName: ref.postscriptFamilyName,
      fonts: rows.map(mapFont).sort(sortFonts),
    }

    return family
  })
}

export type BaseFamilyWithFontPaths = TableMap['families'] & {
  fonts: (BaseFont & {
    path: string
  })[]
}

function resolveInstallDir() {
  const { platform } = process

  if (Object.hasOwn(data[platform as keyof typeof data], 'user')) {
    // @ts-ignore: this is correct
    return data[platform as keyof typeof data].user
  }

  return data[platform as keyof typeof data].system
}

class FontRepository extends Repository<TableMap> {
  async #findOrCreateFamily(
    libraryId: number,
    data: Omit<TableMap['families'], 'id' | 'createdAt' | 'libraryId'>,
  ) {
    const familyRecord = await this.findFamilyByName(libraryId, data.name)

    if (familyRecord == null) {
      return [
        true,
        await this.insert('families', {
          ...data,
          createdAt: toUnixTime(),
          libraryId,
        }),
      ] as const
    }

    return [false, familyRecord] as const
  }

  async #getFamilyFonts(familyId: number) {
    const query = sql`
      SELECT * FROM fonts
      WHERE familyId = ${familyId}
    `

    return this.queryMany<Font>(query)
  }

  async upsertFamily(
    libraryId: number,
    data: Omit<BaseFamilyWithFontPaths, 'id' | 'createdAt' | 'libraryId'>,
  ) {
    const { fonts, ...family } = data
    const [wasFamilyCreated, record] = await this.#findOrCreateFamily(
      libraryId,
      family,
    )

    if (record.libraryId !== libraryId) return wasFamilyCreated

    let wasUpdated = await this.update('families', record.id, family)

    const familyFonts = await this.#getFamilyFonts(record.id)

    for await (const font of fonts) {
      const found = familyFonts?.find((f) => f.fullName === font.fullName)

      if (found != null) {
        const fontUpdated = await this.update('fonts', found.id, font)

        if (fontUpdated) {
          wasUpdated = true
        }
      } else {
        wasUpdated = true

        await this.insert('fonts', {
          ...font,
          createdAt: toUnixTime(),
          familyId: record.id,
        })
      }
    }

    return wasUpdated
  }

  async insertFamily(
    libraryId: number,
    data: Omit<BaseFamilyWithFontPaths, 'id' | 'createdAt' | 'libraryId'>,
  ) {
    const { fonts, ...family } = data

    const { id } = await this.insert('families', {
      ...family,
      libraryId,
      createdAt: toUnixTime(),
    })

    const keys = ['familyId', ...Object.keys(data.fonts.at(0)!)]
    const query = sql`
      INSERT INTO fonts (${raw(keys.toString())})
      VALUES ${bulk(fonts.map((font) => [id, ...Object.values(font)]))}
    `

    await this.run(query)

    return id
  }

  async getFamily(id: number) {
    const query = fontFamilyJoinQuery(sql`
      WHERE id = ${id}
    `)

    const data = await this.queryMany<FontFamilyJoin>(query)

    if (data) {
      return mapFontFamilyJoins(...data).at(0)
    }
  }

  async getFamilies(libraryId: number, page: Page, sort: Sort<FontFamily>) {
    const newSort = {
      col: `families.${sort.col}`,
      dir: sort.dir,
    }

    const query = fontFamilyJoinQuery(sql`
      WHERE libraryId = ${libraryId}
      ${filters.sort(newSort)}
      ${filters.page(page)}
    `)

    const data = await this.queryMany<FontFamilyJoin>(query)

    const total = await this.countFamilies(libraryId)
    const records = mapFontFamilyJoins(...data)

    return createPagedResponse(total, page.index, records)
  }

  findFamilyByName(libraryId: number, name: string) {
    return this.query<TableMap['families']>(sql`
      SELECT * FROM families
      WHERE name = ${name}
      AND libraryId = ${libraryId}
    `)
  }

  streamFamilies(libraryId: number) {
    const query = sql`
      SELECT * FROM families
      WHERE libraryId = ${libraryId}
    `

    const stream = this.stream<FontFamily>(query)

    return stream.pipe(
      new Transform({
        objectMode: true,
        transform: (data, _, cb) => cb(null, data),
      }),
    )
  }

  async countFamilies(libraryId: number) {
    const query = sql`
      SELECT COUNT(*) AS total
      FROM families
      WHERE libraryId = ${libraryId}
    `

    const result = await this.query<{ total: number }>(query)

    return result?.total ?? 0
  }

  async countFonts(libraryId: number) {
    const query = sql`
      SELECT COUNT(*) AS total
      FROM fonts
      JOIN families on families.id = fonts.familyId
      JOIN libraries on libraries.id = families.libraryId
      WHERE libraries.id = ${libraryId}
    `

    const result = await this.query<{ total: number }>(query)

    return result?.total ?? 0
  }

  async executeView(viewName: string, page: Page, sort: Sort<FontFamily>) {
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

    const count = await this.query<{ total: number }>(countQuery)

    if (!count) {
      log.warn(`Unable to determine count total for view "${viewName}"`)
    }

    const records = await this.queryMany<FontFamilyJoin>(query)
    const mapped = mapFontFamilyJoins(...records)

    return createPagedResponse(count?.total ?? 0, page.index, mapped)
  }

  async installFonts(...filePaths: string[]) {
    const dir = resolveInstallDir()

    for await (const filePath of filePaths) {
      await fs.copyFile(filePath, dir)
    }
  }
}

export default new FontRepository()
