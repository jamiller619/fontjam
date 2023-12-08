import EventEmitter from 'events'
import logger from 'logger'
import TypedEmitter from 'typed-emitter'
import { Library } from '@shared/types'
import { formatMs } from '@shared/utils/datetime'
import { FontRepository } from '~/db'
import { fontScanner } from '~/fonts'
import Stats from '~/lib/Stats'

const log = logger('local.scanner')

type ScanEvents = {
  'scan.complete'(library: Library): Promise<void> | void
}

const emitter = new EventEmitter() as TypedEmitter<ScanEvents>

export const on = emitter.on.bind(emitter)
export const off = emitter.off.bind(emitter)

export async function scanLibrary(library: Library) {
  const stats = new Stats({
    fontsAdded: 0,
    fontFamiliesAdded: 0,
  })
    .on('start', () => {
      log.info(`Scanning library "${library.name}"`)
    })
    .on('complete', () => {
      log.info(
        `Scanning library "${library.name}" complete. Added ${
          stats.state.fontFamiliesAdded
        } font families and ${stats.state.fontsAdded} fonts in ${formatMs(
          stats.duration
        )}s`
      )

      emitter.emit('scan.complete', library)
    })
    .start()

  const families = await fontScanner.findFamilies(library.path)

  if (families.length === 0) return stats.complete()

  for await (const family of families) {
    const updated = await FontRepository.upsertFamily(library.id, family)

    if (updated) {
      stats.update(({ fontFamiliesAdded, fontsAdded }) => ({
        fontFamiliesAdded: fontFamiliesAdded + 1,
        fontsAdded: fontsAdded + family.fonts.length,
      }))
    }
  }

  stats.complete()
}
