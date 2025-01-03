import fs from 'node:fs/promises'
import path from 'node:path'
import init from '@fontjam/sqleasy'
import paths from '~/config/paths'
import schema from './schema.sql'

const fileName = path.join(paths.data, 'databases', 'fontjam.db')

await fs.mkdir(path.dirname(fileName), {
  recursive: true,
})

const connect = await init(fileName, schema)

export default connect
