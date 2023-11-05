import logger from 'logger'
import { Library } from '@shared/types'
import { FontParser, FontRepository } from '~/fonts'
import InvalidFontFileError from '~/fonts/InvalidFontFileError'
import scanner from '~/lib/scanner'
import task from '~/lib/task'
import * as CatalogRepository from './CatalogRepository'

const log = logger('library.scanner')

function parseMs(ms: number) {
  return (ms / 1000).toFixed(2)
}

export async function init() {
  log.info(`Library scanner listener initialized`)

  CatalogRepository.on('library.created', scanLibrary)
}

export const scanLibrary = task.createQueue('library.scanner', scan)

async function scan(library: Library) {
  const startTime = Date.now()
  let count = 0

  log.info(`Scanning "${library.name}" library @ ${library.path}`)

  for await (const file of scanner.scanDir(library.path)) {
    try {
      const rel = FontParser.resolveFontFilePath(library.path, file)
      const exists = await FontRepository.exists(library.id, rel)

      if (exists) {
        continue
      }

      const data = await FontParser.parseFile(library, file)

      await FontRepository.create(data)

      count += 1

      log.info(`Added ${file}`)
    } catch (err) {
      if (err instanceof InvalidFontFileError) {
        log.debug(`Skipping ${file}`, err.message)
      } else {
        log.error(`Skipping ${file}`, err as Error)
      }
    }
  }

  if (count === 0) {
    log.info(`Scanning "${library.name}" complete. No fonts added.`)
  } else {
    const endTime = Date.now()
    const duration = endTime - startTime

    log.info(`Added ${count} fonts to ${library.name} in ${parseMs(duration)}s`)
  }
}
