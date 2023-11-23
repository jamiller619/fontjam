import EventEmitter from 'node:events'
import sql, { Sql, bulk, raw } from 'sql-template-tag'
import TypedEmitter, { EventMap } from 'typed-emitter'
import { OptionalId, Page, Paged, Sort } from '@shared/types'
import DatabaseStream from './DatabaseStream'
import db from './db'
import filters from './filters'

export default abstract class Repository<
  O extends { id: number },
  E extends EventMap = EventMap
> extends (EventEmitter as {
  new <E extends EventMap>(): TypedEmitter<E>
})<E> {
  #table: Sql

  stream<R = O>(query: Sql) {
    return new DatabaseStream<R>(query, db)
  }

  constructor(table: string) {
    super()

    this.#table = raw(table)
  }

  query<R = O>(query: Sql) {
    return new Promise<R>((resolve, reject) => {
      db.get(query.text, query.values, function callback(err, row) {
        if (err) reject(err)
        else resolve(row as R)
      })
    })
  }

  queryMany<R = O>(query: Sql) {
    return new Promise<R[]>((resolve, reject) => {
      db.all(query.text, query.values, function callback(err, rows) {
        if (err) reject(err)
        else resolve(rows as R[])
      })
    })
  }

  run(query: Sql) {
    return new Promise<number>((resolve, reject) => {
      db.run(query.text, query.values, function callback(err) {
        if (err) reject(err)
        else resolve(this.lastID)
      })
    })
  }

  async all(page: Page, sort: Sort<O>): Promise<Paged<O>> {
    const records = await this.queryMany(
      sql`SELECT * FROM ${this.#table} ${filters.sort(sort)} ${filters.page(
        page
      )}`
    )

    return {
      records,
      index: page.index,
      length: page.length,
      total: records.length,
    }
  }

  async insert(data: OptionalId<O>) {
    const cols = Object.keys(data)
    const vals = Object.values(data)

    const id = await this.run(
      sql`INSERT INTO ${this.#table} (${raw(cols.toString())}) VALUES ${bulk([
        vals,
      ])}`
    )

    return {
      ...data,
      id,
    }
  }

  async findById(id: number): Promise<O | undefined> {
    if (typeof id !== 'number' || id < 0) {
      throw new Error('Invalid id')
    }

    return this.query(
      sql`SELECT * FROM ${this.#table} WHERE id = ${raw(id.toString())}`
    )
  }

  async find<K extends keyof O>(col: K, value: O[K]) {
    const result = await this.query(
      sql`SELECT * FROM ${this.#table} WHERE ${raw(String(col))} = ${value}`
    )

    return result
  }

  findAll<K extends keyof O>(col: K, value: O[K]) {
    return this.queryMany(
      sql`SELECT * FROM ${this.#table} WHERE ${raw(String(col))} = ${value}`
    )
  }
}
