import sqlite from 'sqlite3'
import Driver from './Driver'

export type { Driver }

export default async function init(fileName: string, schema: string) {
  const db = await new Promise<sqlite.Database>((resolve, reject) => {
    sqlite.cached.Database(fileName, function onCreateCallback(err) {
      if (err) reject(err)

      this.exec(schema, (err) => {
        if (err) reject(err)

        resolve(this)
      })
    })
  })

  return function connect() {
    return new Driver(db)
  }
}
