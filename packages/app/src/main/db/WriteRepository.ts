import sql, { bulk, raw } from 'sql-template-tag'
import { Font, Library, OptionalId } from '@shared/types'
import { toUnixTime } from '@shared/utils/datetime'
import type { Collection } from './CollectionRepository'
import Driver from './Driver'
import type { FontEntity, FontFamilyEntity } from './types'

type TableMap = {
  libraries: Library
  fonts: FontEntity
  families: FontFamilyEntity
  collections: Collection
}

type TableName = keyof TableMap

export type FontCreate = Omit<Font, 'id' | 'createdAt' | 'familyId'>

export type FontFamilyCreate = Omit<
  FontFamilyEntity,
  'id' | 'createdAt' | 'fonts'
> & {
  fonts: FontCreate[]
}

async function getFamilyFonts(driver: Driver, familyId: number) {
  const query = sql`
    SELECT * FROM fonts
    WHERE familyId = ${familyId}
  `

  return driver.queryMany<Font>(query)
}

export default class WriteRepository {
  static async #findOrCreateFamily(
    driver: Driver,
    libraryId: number,
    data: Omit<FontFamilyCreate, 'fonts'>,
  ) {
    const existing = await this.findFamilyByName(driver, libraryId, data.name)

    if (existing == null) {
      return await WriteRepository.insert(driver, 'families', {
        ...data,
        createdAt: toUnixTime(),
        libraryId,
      })
    }

    return existing
  }

  static findFamilyByName(driver: Driver, libraryId: number, name: string) {
    const query = sql`
      SELECT * FROM families
      WHERE name = ${name}
      AND libraryId = ${libraryId}
    `

    return driver.query<FontFamilyEntity>(query)
  }

  static async insert<T extends TableName>(
    driver: Driver,
    table: T,
    data: OptionalId<TableMap[T]>,
  ) {
    const cols = Object.keys(data)
    const vals = Object.values(data)

    const id = await driver.run(
      sql`
        INSERT INTO ${raw(table as string)}
        (${raw(cols.toString())}) VALUES ${bulk([vals])}
      `,
    )

    return {
      ...data,
      id,
    } as TableMap[T]
  }

  static async update<T extends TableName>(
    driver: Driver,
    table: T,
    id: number,
    data: Partial<TableMap[T]>,
  ) {
    const findQuery = sql`
      SELECT * FROM ${raw(table)}
      WHERE id = ${id}
    `

    const findResult = await driver.query(findQuery)

    if (!findResult) {
      throw new Error(
        `Cannot update - unable to find a record in table "${table}" with id "${id}"`,
      )
    }

    const updates: Partial<TableMap[T]> = {}

    for (const key of Object.keys(data)) {
      // @ts-ignore: To keep this readable, omitting "key as
      // keyof blah blah who gives a shit"
      if (findResult[key] == null && data[key] != null) {
        // @ts-ignore: same as above
        updates[key] = data[key]
      }
    }

    const keys = Object.keys(updates)
    const hasUpdates = keys.length

    if (!hasUpdates) {
      return false
    }

    const query = keys.reduce(
      (acc, key) => {
        return sql`
        ${acc},
        ${raw(key)} = ${updates[key as keyof typeof updates]}
      `
      },
      sql`UPDATE ${raw(table as string)} SET`,
    )

    await driver.run(sql`
      ${query}
      WHERE id = ${String(id)}
    `)
  }

  static async upsertFamily(
    driver: Driver,
    libraryId: number,
    data: FontFamilyCreate,
  ) {
    const { fonts, ...family } = data
    const record = await this.#findOrCreateFamily(driver, libraryId, family)

    await this.update(driver, 'families', record.id, family)

    const familyFonts = await getFamilyFonts(driver, record.id)

    for await (const font of fonts) {
      const found = familyFonts?.find((f) => f.fullName === font.fullName)
      const fvar = font.fvar ? JSON.stringify(font.fvar) : null

      if (found != null) {
        await this.update(driver, 'fonts', found.id, {
          ...font,
          fvar,
        })
      } else {
        await this.insert(driver, 'fonts', {
          ...font,
          fvar,
          createdAt: toUnixTime(),
          familyId: record.id,
        })
      }
    }
  }

  static async insertFamily(
    driver: Driver,
    libraryId: number,
    data: FontFamilyCreate,
  ) {
    const { fonts, ...family } = data
    const { id } = await this.insert(driver, 'families', {
      ...family,
      libraryId,
      createdAt: toUnixTime(),
    })

    const keys = ['familyId', ...Object.keys(data.fonts.at(0)!)]
    const query = sql`
      INSERT INTO fonts (${raw(keys.toString())})
      VALUES ${bulk(fonts.map((font) => [id, ...Object.values(font)]))}
    `

    await driver.run(query)

    return id
  }

  static async createLibrary(
    driver: Driver,
    data: Omit<Library, 'createdAt' | 'id'>,
  ) {
    await this.insert(driver, 'libraries', {
      ...data,
      createdAt: toUnixTime(),
    })
  }
}
