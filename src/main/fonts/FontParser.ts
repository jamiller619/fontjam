import fs from 'node:fs/promises'
import path from 'node:path'
import { fromFile as fromFileType } from 'file-type'
import opentype from 'opentype.js'
import { Font, Library, WithoutId } from '@shared/types'
import fileTypes from '~/data/fontFileTypes.json'
import TokenPath from '~/lib/TokenPath'
import { isInstalled } from './FontInstaller'
import InvalidFontFileError from './InvalidFontFileError'

/**
 * Resolves an absolute font file path to a relative path,
 * to store in the database.
 * @param libraryPath The library path as it appears in the
 * database (with or without tokens)
 * @param filePath The absolute path to the font file
 * @returns A relative path to the font file from the library root
 */
export function resolveFontFilePath(libraryPath: string, filePath: string) {
  return filePath.replace(TokenPath.resolve(libraryPath), '')
}

function toArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  )
}

async function parse(filePath: string) {
  const buffer = await fs.readFile(filePath)
  const parsed = opentype.parse(toArrayBuffer(buffer))

  return parsed
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

/**
 * Attempts to parse a file as a font file, and if
 * successful, returns a `Font` object.
 * @param library The library the font belongs to
 * @param filePath The absolute file path to the font
 * @returns If parsing succeeds, returns a `Font` object
 */
export async function parseFile(library: Library, filePath: string) {
  const { isValid, isSupported } = await checkValidity(filePath)

  if (!isValid || !isSupported) {
    throw new InvalidFontFileError(filePath, isValid)
  }

  const parsed = await parse(filePath)

  const font: WithoutId<Font> = {
    libraryId: library.id,
    family: parsed.names.fontFamily.en,
    fullName: parsed.names.fullName.en,
    postscriptName: parsed.names.postScriptName.en,
    style: parsed.names.fontSubfamily.en,
    path: resolveFontFilePath(library.path, filePath),
    isInstalled: isInstalled(filePath) ? 1 : 0,
  }

  return font
}
