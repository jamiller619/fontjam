#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
// @ts-ignore: Typescript cannot figure out that this is a
// node project - it keeps reading types from the 'browser' module
import { fileTypeFromFile } from 'file-type'
import fontFileExtensions from '~/data/fontFileExtensions.json'
import WriteRepository, { FontFamilyCreate } from '~/db/WriteRepository'
import connect from '~/db/connect'
import { ParsedFont, parse } from '~/fonts/parser'
import scandir from '~/lib/scandir'

const [strLibraryId, libraryPath] = process.argv.slice(2)
const libraryId = Number(strLibraryId)

if (!strLibraryId || !libraryPath || Number.isNaN(libraryId)) {
  throw new Error(`Invalid arguments!`)
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

async function parseFile(filePath: string) {
  const { isSupported, isValid } = await validate(filePath)

  if (!isValid || !isSupported) return

  const buffer = await fs.readFile(filePath)

  return parse(filePath, buffer)
}

async function getFamilies(libraryPath: string) {
  const families: Record<string, ParsedFont[]> = {}

  for await (const ent of scandir(libraryPath)) {
    if (ent.type === 'file') {
      const parsed = await parseFile(ent.path)

      if (parsed != null) {
        if (families[parsed.familyName] != null) {
          families[parsed.familyName].push(parsed)
        } else {
          families[parsed.familyName] = [parsed]
        }
      }
    }
  }

  return families
}

console.log(`Scanning "${libraryPath}" for fonts...`)

const data = await getFamilies(libraryPath)
const families = Object.entries(data)

console.log(`Found ${families.length} font families...`)

const conn = connect()

for await (const [familyName, fonts] of families) {
  const ref = fonts.at(0)!

  const family: FontFamilyCreate = {
    copyright: ref.copyright,
    designer: ref.designer,
    libraryId,
    license: ref.license,
    name: familyName,
    popularity: null,
    tags: ref.tags ? JSON.stringify(ref.tags) : null,
    version: null,
    fonts: fonts.map((font) => ({
      fullName: font.fontName,
      path: font.path,
      postscriptName: font.postscriptName,
      style: font.style,
      weight: null,
      fvar: font.fvar,
      fileCreatedAt: font.fileCreatedAt,
    })),
  }

  await WriteRepository.upsertFamily(conn, libraryId, family)
}

await conn.close()

process.exit(1)
