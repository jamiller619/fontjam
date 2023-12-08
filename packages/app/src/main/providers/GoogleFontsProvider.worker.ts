#!/usr/bin/env node
import process from 'node:process'
import { Font, FontFamily } from '@shared/types'
import { toUnixTime } from '@shared/utils/datetime'
import WriteRepository from '~/db/WriteRepository'
import connect from '~/db/connect'
import api from './GoogleFontsAPI'
import { Webfont } from './types'

const [strLibraryId, libraryPath] = process.argv.slice(2)
const libraryId = Number(strLibraryId)

if (!strLibraryId || !libraryPath || Number.isNaN(libraryId)) {
  throw new Error(`Invalid arguments!`)
}

const conn = connect()

function parseVariant(variant: string) {
  const resp = {
    weight: 400,
    style: 'regular',
  }

  if (variant === 'regular') {
    return resp
  }

  if (variant === 'italic') {
    resp.style = 'italic'

    return resp
  }

  const strNum = variant.match(/[0-9]/g)?.join('') ?? ''
  const weight = Number(strNum)
  const style = variant.split(strNum).filter(Boolean).at(0)

  if (!Number.isNaN(weight) && weight > 0) {
    resp.weight = weight
  }

  if (style && style.trim()) {
    resp.style = style.trim()
  }

  return resp
}

// API always returns a string that starts with a "v",
// i.e. "v36", "v12", etc
function parseVersion(version: string) {
  const result = Number(version.slice(1))

  if (Number.isNaN(result) || result < 0) {
    return null
  }

  return result
}

function map(libraryId: number) {
  const now = toUnixTime()

  return function mapFont(popularity: number, webfont: Webfont) {
    const family: Omit<FontFamily, 'id' | 'fonts' | 'tags'> & {
      tags: string | null
      fonts: Omit<Font, 'id' | 'familyId'>[]
    } = {
      libraryId,
      name: webfont.family,
      copyright: null,
      createdAt: now,
      popularity,
      // "webfont.category" appears to be: monospace,
      // sans-serif, etc.
      tags: JSON.stringify([webfont.category]),
      designer: null,
      license: null,
      version: parseVersion(webfont.version),
      fonts: Object.entries(webfont.files).map(([variant, url]) => {
        const { weight, style } = parseVariant(variant)

        const font: Omit<Font, 'id' | 'familyId'> = {
          style,
          weight,
          createdAt: now,
          path: url as string,
          fullName: `${webfont.family} ${style}`.trim(),
          postscriptName: null,
        }

        return font
      }),
    }

    return family
  }
}

const resp = await api.request()

if (!resp) {
  process.exit(1)
}

const mapper = map(libraryId)

let popularity = 1

for await (const font of resp.items) {
  try {
    const mapped = mapper(popularity, font)

    await WriteRepository.upsertFamily(conn, libraryId, mapped)

    popularity += 1
  } catch (err) {
    console.error(`Unable to parse Google Font "${font.family}"`)
  }
}

await conn.close()

process.exit(1)
