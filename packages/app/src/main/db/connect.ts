import fs from 'node:fs/promises'
import path from 'node:path'
import sqlite from 'sqlite3'
import paths from '~/config/paths'
import Driver from './Driver'
import schema from './schema.sql'

const fileName = path.join(paths.data, 'databases', 'fontjam.db')

await fs.mkdir(path.dirname(fileName), {
  recursive: true,
})

const db = await new Promise<sqlite.Database>((resolve, reject) => {
  sqlite.cached.Database(fileName, function onCreateCallback(err) {
    if (err) reject(err)

    this.exec(schema, (err) => {
      if (err) reject(err)

      resolve(this)
    })
  })
})

export default function connect() {
  return new Driver(db)
}
