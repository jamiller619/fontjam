import fs from 'node:fs/promises'
import opentype from 'opentype.js'
import { Font } from '@shared/types'

function toArrayBuffer(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  )
}

/**
 * Attempts to parse a file into a `Font` object.
 * NOTE: No checks are made on the file to determine if it's
 * an actual "font" file!
 * @param filePath The absolute file path of the file
 * @returns If parsing succeeds, returns a `Font` object
 */
export async function parseFile(filePath: string) {
  const buffer = await fs.readFile(filePath)
  const parsed = opentype.parse(toArrayBuffer(buffer))

  const font: Omit<Font, 'id' | 'familyId'> & { family: string } = {
    createdAt: Date.now(),
    family: parsed.names.fontFamily.en,
    fullName: parsed.names.fullName.en,
    postscriptName: parsed.names.postScriptName.en,
    style: parsed.names.fontSubfamily.en,
    path: filePath,
    weight: null,
  }

  return font
}
