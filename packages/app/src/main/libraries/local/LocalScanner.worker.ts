import process from 'node:process'
import sqlite from 'sqlite3'
// import { FontRepository } from '~/db'
import { fontScanner } from '~/fonts'

const [dbFile, id, libraryPath] = process.argv.slice(2)

const libraryId = Number(id)

if (
  !dbFile ||
  !id ||
  !libraryPath ||
  Number.isNaN(libraryId) ||
  libraryId === 0
) {
  throw new Error(`Invalid arguments!`)
}

const families = await fontScanner.findFamilies(libraryPath)

if (families.length === 0) {
  process.exit(1)
}

async function upsertFamily(data: (typeof families)[number]) {
  const { fonts, ...family } = data
}

for await (const family of families) {
  // await FontRepository.upsertFamily(libraryId, family)
  await upsertFamily(family)
}
