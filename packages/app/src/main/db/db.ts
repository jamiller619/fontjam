import fs from 'node:fs/promises'
import path from 'node:path'
import { app } from 'electron'
import logger from 'logger'
import sqlite from 'sqlite3'
import { name } from '@root/package.json'
import { IS_DEV } from '~/config'
import init from './init.sql'

if (IS_DEV) {
  sqlite.verbose()
}

const log = logger('db')

const appData = app.getPath('appData')
const fileName = path.join(appData, name, 'databases', `fontjam.db`)

await fs.mkdir(path.dirname(fileName), {
  recursive: true,
})

log.info(`Database: ${fileName}`)

const db = await new Promise<sqlite.Database>((resolve, reject) => {
  const db = sqlite.cached.Database(fileName, (err) => {
    if (err) {
      reject(err)
    } else {
      db.exec(init, (err) => {
        if (err) reject(err)

        resolve(db)
      })
    }
  })
})

if (IS_DEV) {
  // db.on('trace', log.info.bind(log))
}

export default db
