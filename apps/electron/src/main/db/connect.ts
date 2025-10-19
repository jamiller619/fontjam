import fs from 'node:fs/promises'
import path from 'node:path'
import sqleasy from '@jamr/sqleasy'
import { app } from 'electron'
import schema from './schema.sql'

const fileName = path.join(app.getPath('userData'), 'databases', 'fontjam.db')

await fs.mkdir(path.dirname(fileName), {
  recursive: true,
})

const connect = await sqleasy(fileName, schema)

export default connect
