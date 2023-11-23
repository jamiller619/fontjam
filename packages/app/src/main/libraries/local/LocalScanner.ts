import path from 'node:path'
import EventEmitter from 'events'
//@ts-ignore: Typescript cannot figure out that this is a
//node project - it keeps reading types from the 'browser' module
import { fileTypeFromFile } from 'file-type'
import logger from 'logger'
import TypedEventEmitter from 'typed-emitter'
import { Font, FontFamily, Library } from '@shared/types'
import { formatMs } from '@shared/utils/datetime'
import groupBy from '@shared/utils/groupBy'
import { FontRepository } from '~/db'
import scanner from '~/lib/scanner'
// import task from '~/lib/task'
import { parseFile } from './FontParser'
import fileTypes from './fontFileTypes.json'

const log = logger('library.local.scanner')

type ScanEvents = {
  'scan.complete'(library: Library): Promise<void> | void
}

const emitter = new EventEmitter() as TypedEventEmitter<ScanEvents>

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
  const startTime = Date.now()
  const fonts: Awaited<ReturnType<typeof parseFile>>[] = []
  let fontsAdded = 0
  let fontFamiliesAdded = 0

  log.info(`Scanning library "${library.name}"`)

  for await (const filePath of scanner.scanDir(library.path)) {
    try {
      const { isValid, isSupported } = await checkValidity(filePath)

      if (!isValid || !isSupported) {
        continue
      }

      const exists = await FontRepository.find('path', filePath)

      if (exists != null) continue

      const font = await parseFile(filePath)

      fonts.push(font)
    } catch (err) {
      log.error(`Unable to parse file "${filePath}"`, err as Error)
    }
  }

  if (fonts.length === 0) {
    log.info(`Scanning "${library.name}" complete. No fonts added.`)

    return
  }

  const families = Object.values(groupBy(fonts, (f) => f.family))

  for await (const family of families) {
    const data: Omit<FontFamily<Omit<Font, 'id' | 'familyId'>>, 'id'> = {
      copyright: null,
      createdAt: startTime,
      libraryId: library.id,
      name: family[0].family,
      popularity: null,
      tags: null,
      fonts: family.map((f) => {
        return {
          createdAt: startTime,
          fullName: f.fullName,
          path: f.path,
          postscriptName: f.postscriptName,
          style: f.style,
          weight: f.weight,
        }
      }),
    }

    const familyId = await FontRepository.insertFamily(data)

    if (familyId != null) {
      fontsAdded += data.fonts.length
      fontFamiliesAdded += 1
    }
  }

  const duration = Date.now() - startTime

  log.info(
    `Added ${fontFamiliesAdded} font families (${fontsAdded} fonts) to ${
      library.name
    } in ${formatMs(duration)}s`
  )

  emitter.emit('scan.complete', library)
}
