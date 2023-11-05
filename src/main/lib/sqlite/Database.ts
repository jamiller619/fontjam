import sqlite from 'sqlite3'
import DatabaseStream from './DatabaseStream'

export default class Database<T> extends sqlite.Database {
  stream<R = T>(sql: string) {
    return new DatabaseStream<R>(sql, this)
  }

  runAsync(query: string) {
    return new Promise<number>((resolve, reject) => {
      super.run(query, function callback(err) {
        if (err) reject(err)
        else resolve(this.lastID)
      })
    })
  }

  query<R = T>(query: string) {
    return new Promise<R>((resolve, reject) => {
      this.get(query, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result as R)
        }
      })
    })
  }

  queryMany<R = T>(query: string) {
    return new Promise<R[]>((resolve, reject) => {
      this.all(query, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows as R[])
        }
      })
    })
  }
}
