import path from 'node:path'
import { app } from 'electron'
import logger from 'logger'
import { Base, Page, Paged, Sort, WithoutId } from '@shared/types'
import { Database, connect, sql } from '~/lib/sqlite'
import { name as packageName } from '../../../package.json'

const log = logger('db.repository')

export const filters = {
  sort<T extends Base>(sort: Sort<T>) {
    return sql`ORDER BY ${sort.col} ${sort.dir}`
  },
  page(page: Page) {
    return sql`LIMIT ${page.index * page.length}, ${page.length}`
  },
}

const appData = app.getPath('appData')
const fileName = path.join(appData, packageName, 'databases', `fontjam.db`)

export default class Repository<T extends Base> {
  #table: string
  db: Database<T>

  query: Database<T>['query']
  queryMany: Database<T>['queryMany']
  run: Database<T>['runAsync']
  stream: Database<T>['stream']

  ready: Promise<void>

  constructor(table: string, schema: string) {
    this.#table = table
    this.db = connect<T>(fileName, () => {
      log.info(`Initialized ${table} repository`)
    })

    this.query = this.db.query.bind(this.db)
    this.queryMany = this.db.queryMany.bind(this.db)
    this.run = this.db.runAsync.bind(this.db)
    this.stream = this.db.stream.bind(this.db)

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

  async insertMany(data: WithoutId<T>[]) {
    const cols = Object.keys(data[0])

    const stmt = sql`
      BEGIN TRANSACTION;

      ${data.map((d) => {
        const vals = Object.values(d)

        return sql`INSERT INTO ${this.#table} (${cols}) VALUES (${vals})`
      })}

      COMMIT;
    `

    await this.db.runAsync(stmt)
  }

  async insert(data: WithoutId<T>) {
    const cols = Object.keys(data)
    const vals = Object.values(data)

    const id = await this.db.runAsync(
      sql`INSERT INTO ${this.#table} (${cols}) VALUES (${vals})`
    )

    return {
      ...data,
      id,
    }
  }

  findById(id: number) {
    return this.query<T | undefined>(
      sql`SELECT * FROM ${this.#table} WHERE id = ${id}`
    )
  }

  find<K extends keyof T>(col: K, value: T[K]) {
    return this.query<T | undefined>(
      sql`SELECT * FROM ${this.#table} WHERE ${col} = ${value}`
    )
  }

  findAll<K extends keyof T>(col: K, value: T[K]) {
    return this.queryMany<T | undefined>(
      sql`SELECT * FROM ${this.#table} WHERE ${col} = ${value}`
    )
  }

  async update(id: number, data: Partial<T>) {
    const set = Object.entries(data).map(([k, v]) => `${k} = ${v}`)

    return this.run(sql`UPDATE ${this.#table} SET ${set} WHERE id = ${id}`)
  }

  async remove(id: number) {
    await this.query(sql`DELETE FROM ${this.#table} WHERE id = ${id}`)
  }

  async search(col: keyof T, query: string) {
    return this.queryMany(
      sql`SELECT * FROM ${this.#table} WHERE ${col} MATCH ${query}`
    )
  }
}
