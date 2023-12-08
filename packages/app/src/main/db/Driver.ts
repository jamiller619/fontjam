import type { Sql } from 'sql-template-tag'
import sqlite from 'sqlite3'

export default class Driver {
  #db: sqlite.Database

  constructor(db: sqlite.Database) {
    this.#db = db
  }

  getdb() {
    return this.#db
  }

  close() {
    return new Promise<void>((resolve, reject) => {
      this.getdb().close(function closeCallback(err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  run(query: Sql) {
    return new Promise<number>((resolve, reject) => {
      this.getdb().run(query.text, query.values, function runCallback(err) {
        if (err) reject(err)
        else resolve(this.lastID)
      })
    })
  }

  exec(query: Sql) {
    return new Promise<void>((resolve, reject) => {
      this.getdb().exec(query.text, function execCallback(err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  query<R>(query: Sql) {
    return new Promise<R | undefined>((resolve, reject) => {
      this.getdb().get(
        query.text,
        query.values,
        function getCallback(err, row) {
          if (err) reject(err)
          else resolve(row as R)
        },
      )
    })
  }

  queryMany<R>(query: Sql) {
    return new Promise<R[]>((resolve, reject) => {
      this.getdb().all(
        query.text,
        query.values,
        function allCallback(err, rows) {
          if (err) reject(err)
          else resolve((rows ?? []) as R[])
        },
      )
    })
  }
}
