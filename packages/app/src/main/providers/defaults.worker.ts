#!/usr/bin/env node
import process from 'node:process'
import sysDirs from '~/data/systemDirectories.json'
import WriteRepository from '~/db/WriteRepository'
import connect from '~/db/connect'
import { local as defaultLocalLibraries } from '~/libraries/defaultLibraries.json'

function resolveSystemFontDirs() {
  const { platform } = process

  if (Object.hasOwn(sysDirs, platform)) {
    return sysDirs[platform as keyof typeof sysDirs]
  }

  throw new Error(`Unsupported platform "${platform}"!`)
}

const conn = connect()
const dirs = resolveSystemFontDirs()

for await (const lib of defaultLocalLibraries) {
  const path = lib.name.toLowerCase()

  await WriteRepository.createLibrary(conn, {
    icon: lib.icon,
    isEditable: lib.isEditable as 0 | 1,
    name: lib.name,
    type: 'local',
    path: dirs[path as keyof typeof dirs],
  })
}

await conn.close()

process.exit(1)
