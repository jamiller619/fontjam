import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fromFile } from 'file-type'
import logger from 'logger'
import opentype from 'opentype.js'
import { FontFile } from '@shared/types'
import fileTypes from './file-types.json'

type FileTypeEntry = (typeof fileTypes)[number]

const log = logger('scanner')
const exts = fileTypes.map((e) => e.ext)

const getSystemFontDirectory = () => {
  const { platform } = process

  switch (platform) {
    case 'darwin':
      return '/System/Library/Fonts'
    case 'linux':
      return '/usr/share/fonts'
    case 'win32':
      return 'C:\\Windows\\Fonts'
  }
}

const checkValidity = async (filePath: string) => {
  const type = await fromFile(filePath)
  const ext = path.extname(filePath)
  const isValid =
    type != null
      ? type.mime.includes('font') || exts.includes(type.ext)
      : exts.includes(ext)

  return {
    isValid,
    type,
  }
}

const toArrayBuffer = (buffer: Buffer) => {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  )
}

export default class Scanner {
  dir: string

  constructor(dir?: string) {
    const d = dir ?? getSystemFontDirectory()

    if (!d) {
      throw new Error(`No directory was set while creating a new Scanner!`)
    }

    this.dir = d
  }

  async scan() {
    const fonts: FontFile[] = []

    for await (const file of await fs.readdir(this.dir)) {
      try {
        const filePath = path.join(this.dir, file)
        const { isValid, type } = await checkValidity(filePath)

        if (!isValid) {
          log.info(`Skipping ${filePath} as it is not a font file`)

          continue
        }

        if (type?.mime === 'font/otf' || type?.mime === 'font/ttf') {
          const buffer = await fs.readFile(filePath)
          const font = opentype.parse(toArrayBuffer(buffer))

          fonts.push({
            fontFamily: font.names.fontFamily.en,
            fontSubfamily: font.names.fontSubfamily.en,
            fullName: font.names.fullName.en,
          })
        } else {
          log.info(`Skipping ${filePath} as it is not an OpenType font`)
        }
      } catch (err) {
        console.error(err)
      }
    }

    log.info(`Found ${fonts.length} fonts`)

    return fonts
  }
}
