import { Library } from '@shared/types'
import Provider, { IProvider } from './Provider'

export default class LocalProvider extends Provider implements IProvider {
  constructor() {
    super('dist/providers/LocalProvider.worker.js', 'local.worker')
  }

  match(library: Library) {
    return library.type === 'local'
  }

  init(library: Library) {
    return super.initWorker(library.id.toString(), library.path)
  }
}
