import type { Sql } from 'sql-template-tag'
import sqlite from 'sqlite3'

export default class Driver {
  constructor(public db: sqlite.Database) {}

  close() {
    return new Promise<void>((resolve, reject) => {
      this.db.close(function onDBCloseCallback(err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  run(query: Sql) {
    return new Promise<number>((resolve, reject) => {
      this.db.run(query.text, query.values, function onDBRunCallback(err) {
        if (err) reject(err)
        else resolve(this.lastID)
      })
    })
  }

  exec(query: Sql) {
    return new Promise<void>((resolve, reject) => {
      this.db.exec(query.text, function onDBExecCallback(err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  query<R>(query: Sql) {
    return new Promise<R | undefined>((resolve, reject) => {
      this.db.get(query.text, query.values, function onDBGetCallback(err, row) {
        if (err) reject(err)
        else resolve(row as R)
      })
    })
  }

  queryMany<R>(query: Sql) {
    return new Promise<R[]>((resolve, reject) => {
      this.db.all(
        query.text,
        query.values,
        function onDBAllCallback(err, rows) {
          if (err) reject(err)
          else resolve((rows ?? []) as R[])
        },
      )
    })
  }
}
