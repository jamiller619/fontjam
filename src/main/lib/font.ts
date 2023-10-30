import fs from 'node:fs/promises'
import path from 'node:path'
import { fromFile as fromFileType } from 'file-type'
import opentype from 'opentype.js'
import { Font, Page, Sort } from '@shared/types'
import { Repository, WithoutId, filters } from '~/db'
import { sql } from '~/lib/sqlite'
import fileTypes from './fontFileTypes.json'

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

const FontRepository = new Repository<Font>('fonts', schema)

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

export default {
  create: FontRepository.insert,

  getFonts(libraryId: number, page: Page, sort: Sort<Font>) {
    return FontRepository.query(
      `SELECT * FROM fonts WHERE libraryId = ${libraryId} ${filters.sort(
        sort
      )} ${filters.page(page)};`
    )
  },

  resolvePath(libraryPath: string, filePath: string) {
    return filePath.replace(libraryPath, '')
  },

  async exists(libraryId: number, path: string) {
    const matches = await FontRepository.findAll('path', path)
    const match = matches.find((m) => m.libraryId === libraryId)

    return match != null
  },

  async parseFile(libraryId: number, filePath: string) {
    const { isValid, isSupported } = await checkValidity(filePath)

    if (!isValid) {
      throw new Error(`${filePath} doesn't appear to be a valid font`)
    }

    if (!isSupported) {
      throw new Error(`${filePath} isn't a supported font type`)
    }

    const buffer = await fs.readFile(filePath)
    const parsed = opentype.parse(toArrayBuffer(buffer))

    const font: WithoutId<Font> = {
      libraryId,
      family: parsed.names.fontFamily.en,
      fullName: parsed.names.fullName.en,
      postscriptName: parsed.names.postScriptName.en,
      style: parsed.names.fontSubfamily.en,
      path: filePath,
    }

    return font
  },
}
