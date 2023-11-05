import fs, { constants } from 'node:fs/promises'
import path from 'node:path'
import { CatalogRepository, LibraryModule } from '~/catalog'
import config from '~/config'
import { resolveFontFilePath } from './FontParser'
import { findById, update } from './FontRepository'

function resolveInstallPath() {
  const dest = config.get('install.location')
  const dirs = LibraryModule.resolveSystemFontDirectories()

  if (!dirs) {
    throw new Error(`Unable to resolve system font directories!`)
  }

  if (Object.hasOwn(dirs, dest)) {
    const dir = dirs[dest]

    if (dir) return dir
  }

  return undefined
}

export function isInstalled(filePath: string) {
  const libraries = LibraryModule.resolveSystemFontDirectories()

  const result = Object.values(libraries ?? {}).some(
    (dir) => dir && filePath.startsWith(dir.resolved)
  )

  return result
}

export async function install(ids: number[]) {
  const installPath = resolveInstallPath()

  if (!installPath) {
    throw new Error(`Unable to resolve install path`)
  }

  const errors: Error[] = []
  const libraries = await CatalogRepository.getAllLibraries()

  for await (const id of ids) {
    const font = await findById(id)

    if (!font) {
      throw new Error(`Font "${id}" not found`)
    }

    const lib = libraries.find((l) => l.id === font.libraryId)

    if (!lib) {
      throw new Error(`Library "${font.libraryId}" not found`)
    }

    try {
      const file = resolveFontFilePath(lib.path, font.path)
      const dest = path.join(installPath.resolved, path.basename(file))

      await update(id, {
        isInstalled: 1,
      })

      await fs.copyFile(file, dest, constants.COPYFILE_EXCL)
    } catch (err) {
      errors.push(err as Error)
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join('\n'))
  }
}
