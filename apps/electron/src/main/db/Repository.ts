import fs from 'node:fs/promises'
import path from 'node:path'
import sqleasy, { Driver } from '@jamr/sqleasy'
import { Logger } from '@fontjam/electron-logger'
import { ConfigStore } from '~/config'

export default abstract class Repository {
  #db: Driver | null = null
  #dbPath: string
  #schema: string

  log: Logger

  constructor(config: ConfigStore, log: Logger, schema: string) {
    const configPath = config.get('db.path')

    if (!configPath) {
      throw new Error(`Config not loaded when creating database`)
    }

    this.#dbPath = configPath
    this.#schema = schema
    this.log = log
  }

  async initialize() {
    await fs.mkdir(path.dirname(this.#dbPath), {
      recursive: true,
    })

    if (!this.#db) {
      const db = await sqleasy(this.#dbPath)

      this.#db = db()
    }

    await this.#db.exec(this.#schema)
  }

  get db() {
    if (this.#db) {
      return this.#db
    }

    throw new Error('Database not initialized')
  }

  async close() {
    if (this.#db) {
      await this.#db.close()
      this.#db = null
    }
  }
}
