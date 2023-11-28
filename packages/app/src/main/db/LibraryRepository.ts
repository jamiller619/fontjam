import sql from 'sql-template-tag'
import { Library, LibraryType } from '@shared/types'
import { FontRepository } from '~/db'
import TokenPath from '~/lib/TokenPath'
import Repository from './Repository'
import * as timestamp from './timestamp'

function mapLibrary(data: Library): Library {
  const library: Library = {
    ...data,
    path: TokenPath.resolve(data.path),
  }

  return library
}

type MessageEvents = {
  'library.created'(library: Library): unknown
}

type TableMap = {
  libraries: Library
}

class LibraryRepository extends Repository<TableMap, MessageEvents> {
  async byId(id: number) {
    const result = await this.findById('libraries', id)

    return result != null ? mapLibrary(result) : undefined
  }

  async create(data: Omit<Library, 'createdAt' | 'id'>) {
    const library = await this.insert('libraries', {
      ...data,
      createdAt: timestamp.toStorage(Date.now()),
    })

    this.emit('library.created', mapLibrary(library))
  }

  async getAllOfType(type: LibraryType) {
    const records = await this.queryMany<Library>(sql`
      SELECT * FROM libraries
      WHERE type = ${type}
    `)

    return records.map(mapLibrary)
  }

  async getAll() {
    const records = await this.queryMany<Library>(sql`SELECT * FROM libraries`)

    return records?.map(mapLibrary)
  }

  async getStats(id?: number) {
    if (id == null) {
      return {
        families: 0,
        fonts: 0,
      }
    }

    const families = await FontRepository.countFamilies(id)
    const fonts = await FontRepository.countFonts(id)

    return {
      families,
      fonts,
    }
  }
}

export default new LibraryRepository()
