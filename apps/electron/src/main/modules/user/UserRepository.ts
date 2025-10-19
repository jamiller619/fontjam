import { Logger } from '@fontjam/electron-logger'
import { ConfigStore } from '~/config'
import { Repository } from '~/db'

export default class UserRepository extends Repository {
  constructor(config: ConfigStore, log: Logger) {
    super(config, log, schema)
  }
}

const schema = /* sql */ `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    email TEXT UNIQUE NOT NULL,
    auth_provider TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    name TEXT NOT NULL,
    platform TEXT NOT NULL,
    last_seen_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`
