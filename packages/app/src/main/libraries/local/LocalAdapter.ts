import process from 'node:process'
import { Library } from '@shared/types'
import data from '~/data/systemDirectories.json'
import { LibraryRepository } from '~/db'
import CommonAdapter from '~/libraries/CommonAdapter'
import LibraryAdapter from '~/libraries/LibraryAdapter'
import { local as defaultLocalLibraries } from '~/libraries/defaultLibraries.json'
import { buildIndex } from '~/libraries/search'
import * as LocalScanner from './LocalScanner'

function resolveSystemFontDirs() {
  const { platform } = process

  if (Object.hasOwn(data, platform)) {
    return data[platform as keyof typeof data]
  }

  throw new Error(`Unsupported platform "${platform}"!`)
}

export default class LocalAdapter
  extends CommonAdapter
  implements LibraryAdapter
{
  matches(library: Library) {
    return library.type === 'local'
  }

  async initDefaults() {
    const dirs = resolveSystemFontDirs()

    for await (const lib of defaultLocalLibraries) {
      const path = lib.name.toLowerCase()

      await LibraryRepository.create({
        icon: lib.icon,
        isEditable: lib.isEditable as 0 | 1,
        name: lib.name,
        type: 'local',
        path: dirs[path as keyof typeof dirs],
      })
    }
  }

  override async initLibrary(library: Library) {
    await LocalScanner.scanLibrary(library)
  }

  override async init() {
    LocalScanner.on('scan.complete', async () => {
      await buildIndex('local')
    })
  }
}
