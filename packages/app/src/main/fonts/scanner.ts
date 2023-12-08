import fs from 'node:fs/promises'
import path from 'node:path'
// @ts-ignore: Typescript cannot figure out that this is a
// node project - it keeps reading types from the 'browser' module
import { fileTypeFromFile } from 'file-type'
import type { BaseFamilyWithFontPaths } from '~/db/FontRepository'
import scandir from '~/lib/scandir'
import fileTypes from '~/libraries/local/fontFileTypes.json'
import * as fontParser from './parser'

const exts = fileTypes.map((e) => e.ext)

async function validate(filePath: string) {
  const type = await fileTypeFromFile(filePath)
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

export async function findFamilies(dir: string) {
  const fonts: Omit<
    BaseFamilyWithFontPaths,
    'id' | 'libraryId' | 'createdAt'
  >[] = []

  for await (const font of eachFont(dir)) {
    fonts.push(font)
  }

  return fontParser.parseList(fonts)
}

export async function* eachFont(dir: string) {
  for await (const filePath of scandir(dir)) {
    const { isSupported, isValid } = await validate(filePath)

    if (!isValid || !isSupported) continue

    const buffer = await fs.readFile(filePath)
    const font = fontParser.parse(filePath, buffer)

    if (font != null) {
      yield font
    }
  }
}
