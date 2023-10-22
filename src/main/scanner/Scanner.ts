import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fromFile } from 'file-type'
import opentype from 'opentype.js'
import fileTypes from './file-types.json'

type FileTypeEntry = (typeof fileTypes)[number]

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

const isFontFile = async (filePath: string) => {
  const type = await fromFile(filePath)
  const ext = path.extname(filePath)

  if (type != null) {
    if (type.mime.includes('font') || exts.includes(type.ext)) {
      return true
    }
  }

  return exts.includes(ext)
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

  async *scan() {
    for await (const file of await fs.readdir(this.dir)) {
      try {
        const filePath = path.join(this.dir, file)
        // const isFont = await isFontFile(filePath)
        const buffer = await fs.readFile(filePath)
        const font = opentype.parse(toArrayBuffer(buffer))

        yield font
      } catch (err) {
        console.error(err)
      }
    }
  }
}
