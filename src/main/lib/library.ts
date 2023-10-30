import logger from 'logger'
import { Library } from '@shared/types'
import { Repository } from '~/db'
import font from '~/lib/font'
import scanner from '~/lib/scanner'
import { sql } from '~/lib/sqlite'

const log = logger('lib.library')

const schema = sql`
  id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	createdAt INTEGER NOT NULL,
	isEditable INTEGER DEFAULT 1,
	icon TEXT,
	path TEXT NOT NULL UNIQUE
`

const LibraryRepository = new Repository<Library>('libraries', schema)

function getSystemFontDirectory() {
  const { platform } = process

  switch (platform) {
    case 'darwin':
      return '/System/Library/Fonts'
    case 'linux':
      return '/usr/share/fonts'
    case 'win32':
      return '%windir%\\Fonts'
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

export default {
  async start() {
    await LibraryRepository.ready

    const def = await LibraryRepository.get(1)

    if (def == null) {
      log.info(`Creating default library`)

      await LibraryRepository.insert({
        createdAt: Date.now(),
        name: 'System',
        isEditable: 0,
        icon: 'Tv20Regular',
        path: getSystemFontDirectory(),
      })
    }
  },

  async addLibrary(data: Pick<Library, 'name' | 'path'>) {
    return LibraryRepository.insert({
      createdAt: Date.now(),
      isEditable: 1,
      icon: 'Tv20Regular',
      ...data,
    })
  },

  async getLibraries() {
    const data = await LibraryRepository.all(
      { index: 0, length: 20 },
      { col: 'createdAt', dir: 'asc' }
    )

    return data
  },

  async scanLibrary(library: Library) {
    const startTime = Date.now()

    log.info(`Scanning ${library.name}`)

    for await (const file of scanner.scanDir(library.path)) {
      try {
        const resolved = font.resolvePath(library.path, file)
        const exists = await font.exists(library.id, resolved)

        if (exists) {
          continue
        }

        const data = await font.parseFile(library.id, file)

        await font.create(data)
      } catch (err) {
        log.error(`Skipping ${file}`, err as Error)
      }
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    log.info(`Finished scanning ${library.name} in ${duration}ms`)
  },
}
