import fs from 'node:fs/promises'
import path from 'node:path'
import EventEmitter from 'events'
//@ts-ignore: Typescript cannot figure out that this is a
//node project - it keeps reading types from the 'browser' module
import { fileTypeFromFile } from 'file-type'
import logger from 'logger'
import TypedEmitter from 'typed-emitter'
import { Library } from '@shared/types'
import { formatMs } from '@shared/utils/datetime'
import { FontRepository } from '~/db'
import { BaseFamilyWithFontPaths } from '~/db/FontRepository'
import Stats from '~/lib/Stats'
import scanner from '~/lib/scanner'
// import task from '~/lib/task'
import * as FontFileParser from '~/libraries/FontFileParser'
import fileTypes from './fontFileTypes.json'

const log = logger('local.scanner')

type ScanEvents = {
  'scan.complete'(library: Library): Promise<void> | void
}

const emitter = new EventEmitter() as TypedEmitter<ScanEvents>

export const on = emitter.on.bind(emitter)
export const off = emitter.off.bind(emitter)

// export const scanLibrary = task.createQueue('local.scanner', scan)

const exts = fileTypes.map((e) => e.ext)

async function checkValidity(filePath: string) {
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

export async function scanLibrary(library: Library) {
  const fonts: Omit<
    BaseFamilyWithFontPaths,
    'id' | 'libraryId' | 'createdAt'
  >[] = []

  const stats = new Stats({
    fontsAdded: 0,
    fontFamiliesAdded: 0,
  })
    .on('complete', () => {
      log.info(
        `Added ${stats.state.fontFamiliesAdded} font families (${
          stats.state.fontsAdded
        } fonts) to ${library.name} in ${formatMs(stats.duration)}s`
      )

      emitter.emit('scan.complete', library)
    })
    .on('start', () => {
      log.info(`Scanning library "${library.name}"`)
    })
    .start()

  for await (const filePath of scanner.scanDir(library.path)) {
    try {
      const { isValid, isSupported } = await checkValidity(filePath)

      if (!isValid || !isSupported) {
        continue
      }

      const exists = await FontRepository.find('fonts', 'path', filePath)

      if (exists != null) continue

      const buffer = await fs.readFile(filePath)
      const font = FontFileParser.parse(filePath, buffer)

      if (font) fonts.push(font)
    } catch (err) {
      log.error(`Unable to parse file "${filePath}"`, err as Error)
    }
  }

  if (fonts.length === 0) {
    log.info(`Scanning "${library.name}" complete. No fonts added.`)

    return
  }

  const families = FontFileParser.parseList(fonts)

  for await (const family of families) {
    await FontRepository.upsertFamily(library.id, family)

    stats.update(({ fontFamiliesAdded, fontsAdded }) => ({
      fontFamiliesAdded: fontFamiliesAdded + 1,
      fontsAdded: fontsAdded + family.fonts.length,
    }))
  }

  stats.complete()
}
