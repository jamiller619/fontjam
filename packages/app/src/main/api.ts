import { handle } from '@shared/ipc'
import { NotReadyErr } from '@shared/utils/error'
import type MainWindow from './MainWindow'
import autobind from './autobind'
import fork from './lib/fork'

const NotReady = () => NotReadyErr

export default {
  init(win: MainWindow) {
    handle('choose.directory', win.chooseDirectory.bind(win))
    handle('window.control', async (state) => win.handleWindow(state))

    handle('get.libraries', NotReady)
    handle('create.library', NotReady)
    handle('search.fonts', NotReady)
    handle('get.stats', NotReady)
    handle('install.fonts', NotReady)

    handle('get.families', NotReady)
    handle('get.family', NotReady)
  },

  async start() {
    const { default: connect } = await import('~/db/connect')
    const { default: ReadRepository } = await import('~/db/ReadRepository')

    const conn = connect()

    await fork('dist/providers/defaults.worker.js', 'defaults.worker')

    handle(
      'get.libraries',
      autobind(conn, ReadRepository.getLibraries.bind(ReadRepository)),
    )

    handle(
      'get.families',
      autobind(conn, ReadRepository.getFamilies.bind(ReadRepository)),
    )

    handle(
      'get.family',
      autobind(conn, ReadRepository.getFamily.bind(ReadRepository)),
    )

    handle(
      'get.stats',
      autobind(conn, ReadRepository.getLibraryStats.bind(ReadRepository)),
    )

    const libraries = await ReadRepository.getLibraries(conn)

    const { default: initProviders } = await import('~/providers/init')

    await initProviders(libraries)

    // const addFonts = CollectionRepository.addFonts.bind(CollectionRepository)
    // const removeFonts =
    //   CollectionRepository.removeFonts.bind(CollectionRepository)

    // handle('add.fonts', addFonts)
    // handle('remove.fonts', removeFonts)

    // const installFonts = FontRepository.installFonts.bind(FontRepository)

    // handle('install.fonts', installFonts)

    // await initAdapters(win)
  },
}
