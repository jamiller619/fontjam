import EventEmitter from 'node:events'
import sql, { Sql, bulk, raw } from 'sql-template-tag'
import TypedEmitter, { EventMap } from 'typed-emitter'
import { OptionalId, Page, Paged, Sort } from '@shared/types'
import DatabaseStream from './DatabaseStream'
import db from './db'
import filters from './filters'

type Tables = Record<string, { id: number }>

export default class Repository<
  T extends Tables,
  E extends EventMap = EventMap
> extends (EventEmitter as {
  new <E extends EventMap>(): TypedEmitter<E>
})<E> {
  stream<T>(query: Sql) {
    return new DatabaseStream<T>(query, db)
  }

  query<R>(query: Sql) {
    return new Promise<R | undefined>((resolve, reject) => {
      db.get(query.text, query.values, function callback(err, row) {
        if (err) reject(err)
        else resolve(row as R)
      })
    })
  }

  queryMany<R>(query: Sql) {
    return new Promise<R[]>((resolve, reject) => {
      db.all(query.text, query.values, function callback(err, rows) {
        if (err) reject(err)
        else resolve((rows ?? []) as R[])
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

  exec(query: string) {
    return new Promise<void>((resolve, reject) => {
      db.exec(query, function callback(err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  async all<K extends keyof T>(
    table: K,
    page: Page,
    sort: Sort<T[K]>
  ): Promise<Paged<T[K]>> {
    const records = await this.queryMany<T[K]>(
      sql`SELECT * FROM ${raw(table as string)} ${filters.sort(
        sort
      )} ${filters.page(page)}`
    )

    return {
      records: records ?? [],
      index: page.index,
      length: page.length,
      total: records?.length ?? 0,
    }
  }

  async update<K extends keyof T>(table: K, id: number, data: Partial<T[K]>) {
    const existing = await this.findById(table, id)

    if (!existing) {
      throw new Error(`Unable to find a record with id "${id}"`)
    }

    const updates: Partial<T[K]> = {}

    for (const key of Object.keys(data)) {
      // @ts-ignore: To keep this readable, omitting "key as
      // keyof blah blah who gives a shit"
      if (existing[key] == null && data[key] != null) {
        // @ts-ignore: same as above
        updates[key] = data[key]
      }
    }

    if (Object.keys(updates).length) {
      const keys = Object.keys(updates)

      let query = sql`UPDATE ${raw(table as string)} SET`

      for (const key of keys) {
        query = sql`
          ${query},
          ${raw(key)} = ${updates[key as keyof typeof updates]}
        `
      }

      query = sql`
        ${query}
        WHERE id = ${String(id)}
      `

      await this.run(query)

      return {
        ...updates,
        id,
      } as T[K]
    }
  }

  async insert<K extends keyof T, R extends { id: number } = T[K]>(
    table: K,
    data: OptionalId<R>
  ) {
    const cols = Object.keys(data)
    const vals = Object.values(data)

    const id = await this.run(
      sql`INSERT INTO ${raw(table as string)} (${raw(
        cols.toString()
      )}) VALUES ${bulk([vals])}`
    )

    return {
      ...data,
      id,
    } as R
  }

  async findById<K extends keyof T>(
    table: K,
    id: number
  ): Promise<T[K] | undefined> {
    if (typeof id !== 'number' || id < 0) {
      throw new Error('Invalid id')
    }

    return this.query(
      sql`SELECT * FROM ${raw(table as string)} WHERE id = ${raw(
        id.toString()
      )}`
    )
  }

  async find<K extends keyof T, R = T[K]>(
    table: K,
    col: keyof R,
    value: R[typeof col]
  ) {
    const result = await this.query<R>(
      sql`SELECT * FROM ${raw(table as string)} WHERE ${raw(
        String(col)
      )} = ${value}`
    )

    return result
  }

  findAll<K extends keyof T, R = T[K]>(
    table: K,
    col: keyof R,
    value: R[typeof col]
  ) {
    return this.queryMany<R>(
      sql`SELECT * FROM ${raw(table as string)} WHERE ${raw(
        String(col)
      )} = ${value}`
    )
  }
}
