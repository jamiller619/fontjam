import path from 'node:path'
import { app } from 'electron'
import logger from 'logger'
import { Page, Paged, Sort } from '@shared/types'
import { Database, connect, sql } from '~/lib/sqlite'
import { name as packageName } from '../../../package.json'
import { Base, WithoutId } from './types'

const log = logger('db.repository')

export const filters = {
  sort<T extends Base>(sort: Sort<T>) {
    return sql`ORDER BY ${sort.col} ${sort.dir}`
  },
  page(page: Page) {
    return sql`LIMIT ${page.length} OFFSET ${page.index}`
  },
}

const appData = app.getPath('appData')
const fileName = path.join(appData, packageName, 'databases', `fontjam.db`)

export default class Repository<T extends Base> {
  #table: string
  ready: Promise<void>
  query: Database<T>['query']
  queryMany: Database<T>['queryMany']

  constructor(table: 'libraries' | 'fonts', schema: string) {
    this.#table = table

    const db = connect<T>(fileName, () => {
      log.info(`Initialized ${table} repository`)
    })

    this.query = db.query.bind(db)
    this.queryMany = db.queryMany.bind(db)

    this.ready = this.query(
      sql`CREATE TABLE IF NOT EXISTS ${this.#table} (${schema})`
    ).then(void 0)
  }

  async all(page: Page, sort: Sort<T>): Promise<Paged<T>> {
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

  insert(data: WithoutId<T>) {
    const cols = Object.keys(data)
    const vals = Object.values(data)

    return this.query(
      sql`INSERT INTO ${this.#table} (${cols}) VALUES (${vals})`
    )
  }

  get(id: number) {
    return this.query(sql`SELECT * FROM ${this.#table} WHERE id = ${id}`)
  }

  find<K extends keyof T>(col: K, value: T[K]) {
    return this.query(sql`SELECT * FROM ${this.#table} WHERE ${col} = ${value}`)
  }

  findAll<K extends keyof T>(col: K, value: T[K]) {
    return this.queryMany(
      sql`SELECT * FROM ${this.#table} WHERE ${col} = ${value}`
    )
  }

  remove(id: number) {
    return this.query(sql`DELETE FROM ${this.#table} WHERE id = ${id}`)
  }

  async search(col: keyof T, query: string) {
    return this.queryMany(
      sql`SELECT * FROM ${this.#table} WHERE ${col} MATCH ${query}`
    )
  }
}
