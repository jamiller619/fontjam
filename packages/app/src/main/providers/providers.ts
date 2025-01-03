import { Library } from '@shared/types/dto'
import Provider, { IProvider } from './Provider'

export class LocalProvider extends Provider implements IProvider {
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

export class GoogleFontsProvider extends Provider implements IProvider {
  constructor() {
    super('dist/providers/GoogleFontsProvider.worker.js', 'googlefonts.worker')
  }

  match(library: Library) {
    return library.type === 'remote' && library.name === 'Google Fonts'
  }

  init() {
    return super.initWorker()
  }
}
