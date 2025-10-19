#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import * as dto from '@shared/types/dto'
import * as FontRepository from '~/modules/font/FontRepository'
import * as entity from '~/modules/font/entity'
import { generateHash } from '~/modules/font/hash'
import { ParsedFont, parse } from '~/modules/font/parser'

const [libraryId, libraryPath] = validateArgv()
const families = await getFamilies(libraryPath)

for await (const fonts of Object.values(families)) {
  const ref = fonts.at(0)

  if (!ref) continue

  const family: Omit<entity.FontFamily, 'id' | 'created_at'> = {
    library_id: libraryId,
    name: ref?.familyName,
    metadata: JSON.stringify(ref.metadata),
    fonts: null,
  }

  const familyId = await FontRepository.createFontFamily(family)

  const familyFonts = fonts.map(async (font) => {
    const data: Omit<entity.Font, 'id' | 'created_at'> = {
      family_id: familyId,
      name: font.name,
      url: font.url,
      format: path.extname(font.url).slice(1).toLowerCase() as dto.FontFormat,
      style: font.style,
      weight: font.weight,
      version: font.version,
      license: font.license ? JSON.stringify(font.license) : null,
      metadata: JSON.stringify(font.metadata),
      fvar: font.fvar ? JSON.stringify(font.fvar) : null,
      hash: await generateHash(font.url),
    }

    return data
  })

  await FontRepository.createFontFamily(family)
  await FontRepository.createFonts(await Promise.all(familyFonts))
}

async function getFamilies(libraryPath: string) {
  const families: Record<string, ParsedFont[]> = {}

  for await (const filepath of scandir(libraryPath)) {
    const parsed = await parse(filepath)

    if (parsed != null) {
      const key = parsed.postscriptName ?? parsed.familyName

      if (families[key] != null) {
        families[key].push(parsed)
      } else {
        families[key] = [parsed]
      }
    }
  }

  return families
}

async function* scandir(dir: string): AsyncGenerator<string> {
  const ents = await fs.readdir(dir, {
    withFileTypes: true,
  })

  for await (const ent of ents) {
    const entPath = path.join(ent.path, ent.name)

    if (ent.isFile()) {
      yield entPath
    } else if (ent.isDirectory()) {
      yield* scandir(entPath)
    }
  }
}

function validateArgv() {
  const [libraryId, libraryPath] = process.argv.slice(2)

  if (!libraryId || !libraryPath) {
    throw new Error(`Invalid arguments!`)
  }

  return [libraryId, libraryPath] as const
}
