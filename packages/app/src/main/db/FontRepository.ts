import { Transform } from 'node:stream'
import sql, { Sql, bulk, raw } from 'sql-template-tag'
import { BaseFont, Font, FontFamily, Page, Paged } from '@shared/types'
import groupBy from '@shared/utils/groupBy'
import Repository from './Repository'
import filters from './filters'

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

const fontFamilyJoinQuery = (subQuery: Sql) => sql`
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
    FROM families
    ${subQuery}
  ) as families
  join fonts
  on families.id = fonts.familyId
`

function mapFontFamilyJoins(data: FontFamilyJoin[]) {
  const families = groupBy(data, (d) => String(d.id))

  return Object.values(families).map((rows) => {
    const ref = rows.at(0)!

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
      fonts: rows.map((row) => ({
        createdAt: row.fontCreatedAt,
        familyId: ref.id,
        fullName: row.fullName,
        id: row.fontId,
        path: row.path,
        postscriptName: row.postscriptName,
        style: row.style,
        weight: row.weight,
      })),
    }

    return family
  })
}

export type BaseFamilyWithFontPaths = Omit<TableMap['families'], 'fonts'> & {
  fonts: (BaseFont & {
    path: string
  })[]
}

class FontRepository extends Repository<TableMap> {
  async #findOrInsertFamily(
    libraryId: number,
    data: Omit<TableMap['families'], 'id' | 'createdAt' | 'libraryId'>
  ) {
    const familyRecord = await this.findFamilyByName(libraryId, data.name)

    if (familyRecord == null) {
      return this.insert('families', {
        ...data,
        createdAt: Date.now(),
        libraryId,
      })
    }

    return familyRecord
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
    data: Omit<BaseFamilyWithFontPaths, 'id' | 'createdAt' | 'libraryId'>
  ) {
    const { fonts, ...family } = data
    const record = await this.#findOrInsertFamily(libraryId, family)

    if (record.libraryId === libraryId) {
      await this.update('families', record.id, family)

      const familyFonts = await this.#getFamilyFonts(record.id)

      for await (const font of fonts) {
        const found = familyFonts?.find((f) => f.fullName === font.fullName)

        if (found != null) {
          await this.update('fonts', found.id, font)
        } else {
          await this.insert('fonts', {
            ...font,
            createdAt: Date.now(),
            familyId: record.id,
          })
        }
      }
    }
  }

  async insertFamily(
    libraryId: number,
    data: Omit<BaseFamilyWithFontPaths, 'id' | 'createdAt' | 'libraryId'>
  ) {
    const { fonts, ...family } = data

    const { id } = await this.insert('families', {
      ...family,
      libraryId,
      createdAt: Date.now(),
    })

    const keys = ['familyId', ...Object.keys(data.fonts.at(0)!)]
    const query = sql`
      INSERT INTO fonts (${raw(keys.toString())})
      VALUES ${bulk(fonts.map((font) => [id, ...Object.values(font)]))}
    `

    await this.run(query)

    return id
  }

  async getFamilies(libraryId: number, page: Page) {
    const query = fontFamilyJoinQuery(sql`
      WHERE libraryId = ${libraryId}
      ${filters.page(page)}
    `)

    const data = await this.queryMany<FontFamilyJoin>(query)
    const total = await this.countFamilies(libraryId)
    const records = mapFontFamilyJoins(data)

    const response: Paged<FontFamily> = {
      total,
      records,
      index: page.index,
      length: records.length,
    }

    return response
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

    const stream = this.stream<FontFamilyJoin>(query)

    return stream.pipe(
      new Transform({
        objectMode: true,
        transform: (data, _, cb) => cb(null, console.log('data', data)),
      })
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
}

export default new FontRepository()
