import opentype from 'opentype.js'
import {
  FontVariation,
  FontVariationAxis,
  FontVariationInstance,
} from '@shared/types/dto'
import { slugify } from '@shared/utils/string'

function toArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  )
}

// TODO: Fix this
// This previously used
// electron.app.getPreferredSystemLanguages, in addition
// to "en", but because this file is executed in a
// utilityProcess, it doesn't have access to the electron
// package? Seems odd, but it didn't work when trying to
// import electron and noped that shit out of the park.
const langs = ['en']

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
    return [result]
  }

  return null
}

function parseFVar(table: opentype.Table | undefined) {
  if (!table) return null

  const axes: FontVariationAxis[] = table.axes?.map(
    (axis: Record<string, unknown>) => ({
      tag: axis?.tag,
      minValue: axis?.minValue,
      defaultValue: axis?.defaultValue,
      maxValue: axis?.maxValue,
      name: getName(axis?.name as opentype.LocalizedName),
    }),
  )

  const instances: FontVariationInstance[] = table.instances?.map(
    (inst: Record<string, unknown>) => ({
      name: getName(inst.name as opentype.LocalizedName),
      coordinates: inst.coordinates,
    }),
  )

  const fvar: FontVariation = {
    axes,
    instances,
  }

  return fvar
}

export type ParsedFont = {
  fontName: string
  familyName: string
  path: string
  tags: string[] | null
  postscriptFamilyName: string | null
  postscriptFontName: string | null
  style: string
  copyright: string | null
  designer: string | null
  license: string | null
  fvar: FontVariation | null
}

function getPostscriptNames(font: opentype.Font) {
  const names: Pick<ParsedFont, 'postscriptFamilyName' | 'postscriptFontName'> =
    {
      postscriptFamilyName: null,
      postscriptFontName: null,
    }

  const name = getName(font.names.postScriptName)

  if (!name?.trim()) {
    return names
  }

  const parts = name.split('-')

  if (parts.length === 1) {
    names.postscriptFamilyName = name

    return names
  }

  names.postscriptFontName = parts.pop()!
  names.postscriptFamilyName = parts.join('-')

  return names
}

export function parse(
  fontPath: string,
  buffer: Buffer,
): ParsedFont | undefined {
  const parsed = opentype.parse(toArrayBuffer(buffer))
  const familyName = getName(parsed.names.fontFamily)

  if (!familyName?.trim()) {
    console.warn(`Cannot parse font without a family name`, parsed)

    return undefined
  }

  const fontName = getName(parsed.names.fullName)
  const fontStyle = getName(parsed.names.fontSubfamily)

  if (!fontName?.trim() || !fontStyle?.trim()) {
    console.warn(`Cannot parse font without a font name`, parsed)

    return undefined
  }

  const psNames = getPostscriptNames(parsed)

  const font: ParsedFont = {
    fontName,
    familyName,
    path: fontPath,
    tags: parseTags(parsed.names),
    postscriptFamilyName: psNames.postscriptFamilyName,
    postscriptFontName: psNames.postscriptFontName,
    style: fontStyle.toLowerCase(),
    copyright: getName(parsed.names.copyright),
    designer: getName(parsed.names.designer),
    license: getName(parsed.names.licenseURL) ?? getName(parsed.names.license),
    fvar: parseFVar(parsed.tables['fvar']),
  }

  return font
}
