import { Transform } from 'node:stream'
import sql, { bulk, raw } from 'sql-template-tag'
import { Font, FontFamily, Page, Paged, Tag } from '@shared/types'
import groupBy from '@shared/utils/groupBy'
import Repository from './Repository'

type FontFamilyJoin = Omit<FontFamily, 'fonts' | 'tags'> &
  Omit<Font, 'id' | 'familyId' | 'createdAt'> & {
    tags: string
    fontId: number
    fontCreatedAt: number
  }

const fontFamilyJoinQuery = sql`
  SELECT
    fam.id,
    fam.libraryId,
    fam.createdAt,
    fam.name,
    fam.tags,
    fam.copyright,
    fam.popularity,
    fnt.id as fontId,
    fnt.createdAt as fontCreatedAt,
    fnt.fullName,
    fnt.path,
    fnt.postscriptName,
    fnt.style,
    fnt.weight
  FROM families AS fam
  JOIN fonts AS fnt
  ON fam.id = fnt.familyId
`

function sortFonts(a: Font, b: Font) {
  const na = a.fullName.toUpperCase()
  const nb = b.fullName.toUpperCase()

  if (na < nb) return -1
  if (na > nb) return 1

  return 0
}

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
      tags: JSON.parse(ref.tags) as Tag[],
      fonts: rows
        .map((row) => ({
          createdAt: row.fontCreatedAt,
          familyId: ref.id,
          fullName: row.fullName,
          id: row.fontId,
          path: row.path,
          postscriptName: row.postscriptName,
          style: row.style,
          weight: row.weight,
        }))
        .sort(sortFonts),
    }

    return family
  })
}

class FontRepository extends Repository<Font> {
  constructor() {
    super('fonts')
  }

  async insertFamily(
    data: Omit<FontFamily<Omit<Font, 'id' | 'familyId'>>, 'id'>
  ) {
    const { fonts, ...family } = data

    const exists = await this.query<{ count: number }>(sql`
      SELECT COUNT(*) as count FROM
      families
      WHERE name = ${data.name}
      AND libraryId = ${data.libraryId}
    `)

    if (exists.count > 0) return

    const id = await this.run(sql`
      INSERT INTO families (${raw(Object.keys(family).toString())})
      VALUES ${bulk([Object.values(family)])}
    `)

    const keys = ['familyId', ...Object.keys(data.fonts.at(0)!)]

    await this.run(sql`
      INSERT INTO fonts (${raw(keys.toString())})
      VALUES ${bulk(fonts.map((font) => [id, ...Object.values(font)]))}
    `)

    return id
  }

  async getFamilies(libraryId: number, page: Page) {
    const data = await this.queryMany<FontFamilyJoin>(sql`
      ${fontFamilyJoinQuery}
      WHERE fam.libraryId = ${libraryId}
    `)
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

  findFamilyByName(name: string) {
    return this.query<Omit<FontFamily, 'fonts'>>(sql`
      SELECT * FROM families
      WHERE name = "${raw(name)}"
    `)
  }

  async getFamily(familyId: number) {
    const data = await this.queryMany<FontFamilyJoin>(sql`
      ${fontFamilyJoinQuery}
      WHERE fam.id = ${familyId}
    `)

    return mapFontFamilyJoins(data).at(0)
  }

  streamFamilies(libraryId: number) {
    const stream = this.stream<FontFamilyJoin>(sql`
      SELECT * FROM
      families
      WHERE libraryId = ${libraryId}
    `)

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

    return result.total
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

    return result.total
  }
}

export default new FontRepository()
