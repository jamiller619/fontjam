import crypto from 'node:crypto'
import { Logger } from '@fontjam/electron-logger'
import * as dto from '@shared/types/dto'
import { AllowNullableKeys } from '@shared/types/utils'
import { ConfigStore } from '~/config'
import { Repository } from '~/db'
import * as mapper from './mapper'
import { entity } from './types'

export default class LibraryRepository extends Repository {
  constructor(config: ConfigStore, log: Logger) {
    super(config, log, schema)
  }

  async getLibraries(): Promise<dto.Library[]> {
    const query = /* sql */ `
      SELECT * FROM libraries
    `

    const results = await this.db.many<entity.Library>(query)

    return results.map(mapper.from)
  }

  async createLibrary(
    library: AllowNullableKeys<dto.Library, 'id' | 'createdAt'>,
  ): Promise<string> {
    const query = /* sql */ `
      INSERT INTO libraries (
        id, updated_at, user_id,
        name, description, visibility, source
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const id = crypto.randomUUID()

    const values = [
      id,
      null,
      library.userId,
      library.name,
      library.description,
      library.visibility,
      JSON.stringify(library.source),
    ]

    await this.db.one<entity.Library>(query, values)

    return id
  }

  async deleteLibrary(id: string) {
    const query = /* sql */ `
      DELETE FROM libraries
      WHERE id = ?
    `

    await this.db.run(query, id)
  }
}

const schema = /* sql */ `
  CREATE TABLE IF NOT EXISTS libraries (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER,
    user_id TEXT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    visibility TEXT NOT NULL,
    source JSON NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,
    font_id INTEGER NOT NULL,
    library_id INTEGER NOT NULL,
    FOREIGN KEY (font_id) REFERENCES fonts (id),
    FOREIGN KEY (library_id) REFERENCES libraries (id)
  );
`
