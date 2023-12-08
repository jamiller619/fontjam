import logger from 'logger'
import sql from 'sql-template-tag'
import { FontRepository } from '~/db'
import Repository from './Repository'

const log = logger('collection.repository')

export type Collection = {
  id: number
  fontId: number
  libraryId: number
}

class CollectionRepository extends Repository<{ collections: Collection }> {
  async addFonts(libraryId: number, ...fontIds: number[]) {
    for await (const fontId of fontIds) {
      const font = await FontRepository.findById('fonts', fontId)

      if (!font) {
        log.warn(
          `Unable to add font because we can't find one with the id "${fontId}"`
        )

        return
      }

      await this.insert('collections', {
        fontId: font.id,
        libraryId,
      })
    }
  }

  async removeFonts(libraryId: number, ...fontIds: number[]) {
    for await (const fontId of fontIds) {
      try {
        const query = sql`
          DELETE FROM collections
          WHERE libraryId = ${libraryId}
          AND fontId = ${fontId}
        `

        await this.run(query)
      } catch (err) {
        log.error(
          `Unable to delete font "${fontId}" from collection "${libraryId}"!`,
          err as Error
        )
      }
    }
  }
}

export default new CollectionRepository()
