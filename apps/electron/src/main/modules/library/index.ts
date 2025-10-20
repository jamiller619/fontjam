import path from 'node:path'
import * as dto from '@shared/types/dto'
import { AllowNullableKeys } from '@shared/types/utils'
import Module from '~/core/Module'
import LibraryRepository from './LibraryRepository'

export default class LibraryModule extends Module {
  repository: LibraryRepository

  constructor(...args: ConstructorParameters<typeof Module>) {
    super(...args)

    this.repository = new LibraryRepository(this.config, this.log)
  }

  override async onInitialize() {
    await this.repository.initialize()
  }

  override async onDestroy() {
    await this.repository.close()
  }

  protected override getWorkerPath(): string {
    return path.join(this.config.get('worker.path'), 'library.worker.js')
  }

  override api = {
    'library.create': async (
      data: AllowNullableKeys<dto.Library, 'id' | 'createdAt'>,
    ) => {
      const id = await this.repository.createLibrary(data)

      this.emit('library.created', {
        ...data,
        id,
      })
    },

    'libraries.get': () => {
      return this.repository.getLibraries()
    },

    'library.delete': async (id: string) => {
      await this.repository.deleteLibrary(id)
    },
  }
}
