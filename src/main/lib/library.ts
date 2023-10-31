import logger from 'logger'
import { Library } from '@shared/types'
import { Repository } from '~/db'
import font, { InvalidFontFileError } from '~/lib/font'
import scanner from '~/lib/scanner'
import { sql } from '~/lib/sqlite'
import task from './task'

const log = logger('lib.library')

const schema = sql`
  id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL UNIQUE,
	createdAt INTEGER NOT NULL,
	isEditable INTEGER DEFAULT 1,
	icon TEXT,
  path TEXT NOT NULL UNIQUE
`

function getFontDirectories() {
  const { platform } = process

  switch (platform) {
    case 'darwin':
      return {
        system: '/System/Library/Fonts',
      }
    case 'linux':
      return {
        system: '/usr/share/fonts',
      }
    case 'win32':
      return {
        system: '%windir%\\Fonts',
        user: '%localappdata%\\Microsoft\\Windows\\Fonts',
      }
  }

  return undefined
}

async function scanLibrary(library: Library) {
  const startTime = Date.now()
  let count = 0

  log.info(`Scanning "${library.name}" library @ ${library.path}`)

  for await (const file of scanner.scanDir(library.path)) {
    try {
      const resolved = font.resolvePath(library.path, file)
      const exists = await font.exists(library.id, resolved)

      if (exists) {
        continue
      }

      const data = await font.parseFile(library, file)

      await font.create(data)

      count += 1

      log.info(`Added ${file}`)
    } catch (err) {
      if (err instanceof InvalidFontFileError) {
        log.debug(`Skipping ${file}`, err.message)
      } else {
        log.error(`Skipping ${file}`, err as Error)
      }
    }
  }

  const endTime = Date.now()
  const duration = endTime - startTime

  log.info(`Added ${count} fonts to ${library.name} in ${duration}ms`)
}

function mapLibrary(data: Library): Library {
  return {
    ...data,
    path: library.resolvePath(data.path),
  }
}

async function initializeLibraries(libraries: Library[]) {
  return function createDefaultLibrary(name: string, path?: string) {
    if (!path) {
      return
    }

    const exists = libraries.find((l) => l.path === path)

    if (exists == null) {
      log.info(`Creating ${name} library`)

      return library.addLibrary({
        name,
        path,
        isEditable: 0,
      })
    }
  }
}

let repo = null as Repository<Library> | null

const library = {
  get repo() {
    return (repo ??= new Repository('libraries', schema))
  },
  resolvePath(dir: string) {
    return dir.replace(/%([^%]+)%/g, (_, name) => process.env[name] ?? '')
  },
  scanLibrary: task.createQueue('library.scanner', scanLibrary),

  async getAllLibraries() {
    const libraries = await this.repo.queryMany(sql`SELECT * FROM libraries`)

    return libraries.map(mapLibrary)
  },

  async start(): Promise<void> {
    await this.repo.ready

    const libraries = await library.getAllLibraries()
    const createLibrary = await initializeLibraries(libraries)
    const dirs = getFontDirectories()

    await createLibrary('System', dirs?.system)
    await createLibrary('User', dirs?.user)

    for await (const lib of libraries) {
      await this.scanLibrary(lib)
    }
  },

  async addLibrary(data: Pick<Library, 'name' | 'path'> & Partial<Library>) {
    const library = await this.repo.insert({
      createdAt: Date.now(),
      isEditable: 1,
      icon: 'Tv20Regular',
      ...data,
    })

    await this.scanLibrary(library)
  },
}

export default library
