import process from 'node:process'
import { Library } from '@shared/types'
import TokenPath from '~/lib/TokenPath'
import * as CatalogRepository from './CatalogRepository'
import * as LibraryScanner from './LibraryScanner'
import { libraries } from './defaults.json'

type SystemFontDirectory = {
  system?: TokenPath
  user?: TokenPath
}

export function resolveSystemFontDirectories():
  | SystemFontDirectory
  | undefined {
  const { platform } = process

  switch (platform) {
    case 'darwin':
      return {
        system: new TokenPath('/System/Library/Fonts'),
      }
    case 'linux':
      return {
        system: new TokenPath('/usr/share/fonts'),
      }
    case 'win32':
      return {
        system: new TokenPath('%windir%\\Fonts'),
        user: new TokenPath('%localappdata%\\Microsoft\\Windows\\Fonts'),
      }
  }
}

export async function init() {
  await CatalogRepository.ready
  await LibraryScanner.init()

  const records = await CatalogRepository.getAllLibraries()
  const dirs = resolveSystemFontDirectories()

  if (dirs == null) {
    throw new Error(`Unable to resolve directories for system fonts!`)
  }

  for await (const lib of libraries) {
    const exists = records.find((r) => r.name === lib.name)

    if (exists == null) {
      await CatalogRepository.createLibrary({
        icon: lib.icon as Library['icon'],
        path: dirs[lib.name.toLowerCase() as keyof typeof dirs]!.path,
        isEditable: lib.isEditable as 0 | 1,
        name: lib.name,
      })
    }
  }
}
