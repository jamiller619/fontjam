import fs from 'node:fs/promises'
import path from 'node:path'
import logger from 'logger'
import sqlite from 'sqlite3'
import { IS_DEV } from '~/config'
import { paths } from '~/config'
import schema from './schema.sql'

if (IS_DEV) {
  sqlite.verbose()
}

const log = logger('db')

const fileName = path.join(paths.data, 'databases', 'fontjam.db')

await fs.mkdir(path.dirname(fileName), {
  recursive: true,
})

log.info(`Database: ${fileName}`)

const db = await new Promise<sqlite.Database>((resolve, reject) => {
  const db = sqlite.cached.Database(fileName, (err) => {
    if (err) {
      reject(err)
    } else {
      db.exec(schema, (err) => {
        if (err) reject(err)

        resolve(db)
      })
    }
  })
})

export default db
