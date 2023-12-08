import fs from 'node:fs/promises'
import path from 'node:path'
import sqlite from 'sqlite3'
import paths from '~/config/paths'
import connectDB from '~/db/connect'

const fileName = path.join(paths.data, 'databases', 'fontjam.db')

await fs.mkdir(path.dirname(fileName), {
  recursive: true,
})

const modes = {
  read: sqlite.OPEN_READONLY | sqlite.OPEN_CREATE | sqlite.OPEN_FULLMUTEX,
  write: sqlite.OPEN_READWRITE | sqlite.OPEN_CREATE | sqlite.OPEN_FULLMUTEX,
}

export function createConnector(type: 'read' | 'write') {
  return function connect() {
    return connectDB(fileName, modes[type])
  }
}
