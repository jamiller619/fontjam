import fs from 'node:fs/promises'
import path from 'node:path'
import { fromFile as fromFileType } from 'file-type'
import opentype from 'opentype.js'
import {
  Family,
  Font,
  Library,
  Page,
  Paged,
  Sort,
  WithoutId,
} from '@shared/types'
import { Repository, filters } from '~/db'
import { sql } from '~/lib/sqlite'
import fileTypes from './fontFileTypes.json'
import library from './library'

const schema = sql`
  id INTEGER PRIMARY KEY AUTOINCREMENT,
	libraryId INTEGER NOT NULL,
	family TEXT NOT NULL,
	fullName TEXT,
	postscriptName TEXT,
	style TEXT,
	path TEXT,
	FOREIGN KEY(libraryId) REFERENCES libraries(id)
`

function toArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  )
}

const exts = fileTypes.map((e) => e.ext)

async function checkValidity(filePath: string) {
  const type = await fromFileType(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const isValid =
    type != null
      ? type.mime.includes('font') || exts.includes(type.ext)
      : exts.includes(ext)

  const isSupported =
    isValid && (type?.mime === 'font/otf' || type?.mime === 'font/ttf')

  return {
    isSupported,
    isValid,
  }
}

let repo: Repository<Font> | null = null

export class InvalidFontFileError extends Error {
  constructor(filePath: string, isValid: boolean) {
    const msg = isValid ? `isn't a supported font` : `is an invalid font`

    super(`${filePath} ${msg}`)
  }
}

type FamilyQueryResponse = {
  ids: string
  family: string
  styles: string
  paths: string
  postscriptNames: string
}

function mapFamily(libraryId: number) {
  return function map({
    ids,
    paths,
    family,
    styles,
    postscriptNames,
  }: FamilyQueryResponse) {
    const fontIds = ids.split(',').filter(String).map(Number)
    const fonts = fontIds.map((id, i) => {
      return {
        id,
        style: styles.split(',').at(i) as string,
        path: paths.split(',').at(i) as string,
        postscriptName: postscriptNames.split(',').at(i) as string,
      }
    })

    const fontFamily: Family = {
      name: family,
      libraryId,
      fonts,
    }

    return fontFamily
  }
}

export default {
  get repo() {
    return (repo ??= new Repository<Font>('fonts', schema))
  },

  create(data: WithoutId<Font>) {
    return this.repo.insert(data)
  },

  async getFamilies(libraryId: number, page: Page) {
    const query = sql`
      SELECT
        group_concat(id) as ids,
        family,
        group_concat(path) as paths,
        group_concat(style) as styles,
        group_concat(postscriptName) as postscriptNames
      FROM fonts
      WHERE libraryId = ${libraryId}
      GROUP BY family ${filters.page(page)}
    `

    const totalQuery = sql`
      SELECT COUNT(*) as total
      FROM fonts
      WHERE libraryId = ${libraryId}
      GROUP BY family
    `

    const total = (await this.repo.queryMany<{ total: number }>(totalQuery))
      .length

    const records = await this.repo.queryMany<FamilyQueryResponse>(query)

    const response: Paged<Family> = {
      index: page.index,
      length: page.length,
      records: records.map(mapFamily(libraryId)),
      total,
    }

    return response
  },

  async getFonts(libraryId: number, page: Page, sort: Sort<Font>) {
    const records = await this.repo.queryMany(
      sql`SELECT * FROM fonts WHERE libraryId = ${libraryId} ${filters.sort(
        sort
      )} ${filters.page(page)}`
    )

    const response: Paged<Font> = {
      index: page.index,
      length: page.length,
      records,
      total: records.length,
    }

    return response
  },

  resolvePath(libraryPath: string, filePath: string) {
    return filePath.replace(library.resolvePath(libraryPath), '')
  },

  async exists(libraryId: number, path: string) {
    const matches = await this.repo.findAll('path', `"${path}"`)
    const match = matches.find((m) => m.libraryId === libraryId)

    return match != null
  },

  async parseFile(library: Library, filePath: string) {
    const { isValid, isSupported } = await checkValidity(filePath)

    if (!isValid || !isSupported) {
      throw new InvalidFontFileError(filePath, isValid)
    }

    const buffer = await fs.readFile(filePath)
    const parsed = opentype.parse(toArrayBuffer(buffer))

    const font: WithoutId<Font> = {
      libraryId: library.id,
      family: parsed.names.fontFamily.en,
      fullName: parsed.names.fullName.en,
      postscriptName: parsed.names.postScriptName.en,
      style: parsed.names.fontSubfamily.en,
      path: this.resolvePath(library.path, filePath),
    }

    return font
  },
}
