import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
// @ts-ignore: Typescript cannot figure out that this is a
// node project - it keeps reading types from the 'browser' module
import { fileTypeFromFile } from 'file-type'
import opentype from 'opentype.js'
import * as dto from '@shared/types/dto'
import {
  FontVariation,
  FontVariationAxis,
  FontVariationInstance,
} from '@shared/types/dto'
import fontFileExtensions from './fontFileExtensions.json'

export type ParsedFont = Pick<
  dto.Font,
  | 'name'
  | 'url'
  | 'format'
  | 'weight'
  | 'style'
  | 'version'
  | 'license'
  | 'metadata'
  | 'fvar'
> & {
  familyName: string
  postscriptName?: string
}

export async function parse(filePath: string) {
  const { isSupported, isValid } = await validate(filePath)

  if (!isValid || !isSupported) return

  const buffer = await fs.readFile(filePath)
  const parsed = parseFile(filePath, buffer)

  if (parsed == null) {
    return undefined
  }

  return parsed
}

async function validate(filePath: string) {
  const type = await fileTypeFromFile(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const isValid =
    type != null
      ? type.mime.includes('font') || fontFileExtensions.includes(type.ext)
      : fontFileExtensions.includes(ext)

  const isSupported =
    isValid && (type?.mime === 'font/otf' || type?.mime === 'font/ttf')

  return {
    isSupported,
    isValid,
  }
}

function parseFile(fontPath: string, buffer: Buffer): ParsedFont | undefined {
  const parsed = opentype.parse(toArrayBuffer(buffer))
  const familyName = getName(parsed.names.fontFamily)

  if (!familyName?.trim()) {
    console.warn(`Cannot parse font without a family name`, parsed)

    return undefined
  }

  const fontStyle = getName(parsed.names.fontSubfamily)
  const fontName = getName(parsed.names.fullName)

  if (!fontStyle?.trim() || !fontName?.trim()) {
    log.warn(`Cannot parse font without a font name`, parsed)

    return undefined
  }

  const license = (getName(parsed.names.licenseURL) ??
    getName(parsed.names.license) ??
    null) as dto.FontLicense | null

  const font: ParsedFont = {
    name: fontName,
    url: pathToFileURL(fontPath).toString(),
    format: path.extname(fontPath).slice(1).toLowerCase() as dto.FontFormat,
    weight: parsed.tables.os2?.usWeightClass ?? undefined,
    style: fontStyle.toLowerCase(),
    version: getName(parsed.names.version),
    license,
    fvar: parseFVar(parsed.tables['fvar']),
    metadata: parseMetadata(parsed.names),
    familyName,
    postscriptName: getName(parsed.names.postScriptName) ?? undefined,
  }

  return font
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

function parseMetadata(namesTable: opentype.FontNames) {
  const meta: dto.FontMetadata = {
    postscriptName: getName(namesTable.postScriptName) ?? undefined,
    subFamily: getName(namesTable.fontSubfamily) ?? undefined,
    designer: getName(namesTable.designer) ?? undefined,
    fullName: getName(namesTable.fullName) ?? undefined,
    manufacturer: getName(namesTable.manufacturer) ?? undefined,
    copyright: getName(namesTable.copyright) ?? undefined,
    description: getName(namesTable.description) ?? undefined,
    designerURL: getName(namesTable.designerURL) ?? undefined,
    licenseURL: getName(namesTable.licenseURL) ?? undefined,
  }

  return meta
}

function toArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  )
}
