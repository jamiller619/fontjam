import sqlite from 'sqlite3'

function formatNull<T>(val: T) {
  if (val == null) return 'NULL'

  return val
}

function formatArray<T>(arr: T[]) {
  return arr.map((k) => `"${formatNull(String(k))}"`).join(', ')
}

type Prim = string | number | undefined | null | symbol

export function sql(strings: TemplateStringsArray, ...keys: (Prim | Prim[])[]) {
  const result = [strings[0]]

  keys.forEach((key, i) => {
    const val = Array.isArray(key)
      ? formatArray(key)
      : formatNull(String(key)).trim()

    result.push(val, strings[i + 1])
  })

  return result.join('')
}

export class Database<T> extends sqlite.Database {
  query(query: string) {
    return new Promise<T>((resolve, reject) => {
      this.get(query, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result as T)
        }
      })
    })
  }

  queryMany(query: string) {
    return new Promise<T[]>((resolve, reject) => {
      this.all(query, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows as T[])
        }
      })
    })
  }
}

export function connect<T>(fileName: string, successCallback?: () => void) {
  const db = new Database<T>(fileName, (err) => {
    if (err) {
      throw err
    }

    if (successCallback) successCallback()
  })

  return db
}
