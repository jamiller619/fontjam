#!/usr/bin/env node
import process from 'node:process'
import { Library, LibraryType } from '@shared/types'
import defaultLibraries from '~/data/defaultLibraries.json'
import sysDirs from '~/data/systemDirectories.json'
import WriteRepository from '~/db/WriteRepository'
import connect from '~/db/connect'

const conn = connect()
const dirs = resolveSystemFontDirs()

function resolveSystemFontDirs() {
  const { platform } = process

  if (Object.hasOwn(sysDirs, platform)) {
    return sysDirs[platform as keyof typeof sysDirs]
  }

  throw new Error(`Unsupported platform "${platform}"!`)
}

type DefaultLibraryData = Pick<Library, 'name' | 'icon' | 'isEditable'> & {
  path?: string
}

function resolvePath(type: LibraryType, lib: DefaultLibraryData) {
  if (type === 'local') {
    return dirs[lib.name.toLowerCase() as keyof typeof dirs]
  }

  return lib.path!
}

for await (const type of Object.keys(defaultLibraries) as LibraryType[]) {
  for await (const lib of defaultLibraries[type]) {
    await WriteRepository.createLibrary(conn, {
      icon: lib.icon,
      isEditable: lib.isEditable as 0 | 1,
      name: lib.name,
      type,
      path: resolvePath(type, lib as DefaultLibraryData),
    })
  }
}

await conn.close()

process.exit(1)
