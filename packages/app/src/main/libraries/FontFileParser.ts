import { app } from 'electron'
import logger from 'logger'
import opentype from 'opentype.js'
import slugify from '@shared/utils/slugify'
import { BaseFamilyWithFontPaths } from '~/db/FontRepository'

const log = logger('font.parser')

export function parseList<T extends { name: string; fonts: unknown[] }>(
  data: T[]
) {
  const copy = [...data]
  const families: Record<string, T> = {}

  while (copy.length) {
    const family = copy.pop()!

    if (family == null) continue
    if (families[family.name]) {
      families[family.name].fonts.push(...family.fonts)
    } else {
      families[family.name] = family
    }
  }

  return Object.values(families)
}

function toArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  )
}

const langs = [...app.getPreferredSystemLanguages(), 'en']

function getName(prop?: opentype.LocalizedName) {
  if (!prop) return null

  for (const lang of langs) {
    const match = prop[lang]

    if (match && match.trim()) return match.trim()
  }

  return null
}

function parseTags(names: opentype.FontNames) {
  const tag = getName(names.fontSubfamily)
  const result = slugify(tag)

  if (result) {
    return JSON.stringify([result])
  }

  return null
}

export function parse(fontPath: string, buffer: Buffer) {
  const parsed = opentype.parse(toArrayBuffer(buffer))
  const familyName = getName(parsed.names.fontFamily)

  if (!familyName) {
    log.warn(`Cannot parse font without a family name`, parsed)

    return undefined
  }

  const fontName = getName(parsed.names.fullName)
  const fontStyle = getName(parsed.names.fontSubfamily)

  if (!fontName || !fontStyle) {
    log.warn(`Cannot parse font without a font name`, parsed)

    return undefined
  }

  const family: Omit<
    BaseFamilyWithFontPaths,
    'id' | 'libraryId' | 'createdAt'
  > = {
    copyright: getName(parsed.names.copyright),
    designer: getName(parsed.names.designer),
    license: getName(parsed.names.licenseURL) ?? getName(parsed.names.license),
    name: familyName,
    popularity: null,
    tags: parseTags(parsed.names),
    version: null,
    fonts: [
      {
        fullName: fontName,
        postscriptName: getName(parsed.names.postScriptName),
        style: fontStyle.toLowerCase(),
        weight: null,
        path: fontPath,
      },
    ],
  }

  return family
}
