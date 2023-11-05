import { Readable } from 'node:stream'
import sqlite from 'sqlite3'
import type Database from './Database'

export default class DatabaseStream<T> extends Readable {
  stmt: sqlite.Statement

  constructor(sql: string, db: Database<T>) {
    super({ objectMode: true })

    this.stmt = db.prepare(sql)
    this.on('end', () => this.stmt.finalize())
  }

  _read() {
    this.stmt.get((err, result) => {
      if (err) {
        this.emit('error', err)
      } else {
        this.push(result || null)
      }
    })
  }
}
