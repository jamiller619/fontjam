import { Readable } from 'node:stream'
import { Sql } from 'sql-template-tag'
import sqlite from 'sqlite3'

export default class DatabaseStream<T> extends Readable {
  stmt: sqlite.Statement

  constructor(sql: Sql, db: sqlite.Database) {
    super({ objectMode: true })

    this.stmt = db.prepare(sql.text, sql.values)
    this.on('end', () => this.stmt.finalize())
  }

  override _read() {
    this.stmt.get<T>((err, result) => {
      if (err) {
        this.emit('error', err)
      } else {
        this.push(result || null)
      }
    })
  }
}
