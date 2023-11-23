import { handle } from '@shared/ipc'
import { NotReadyErr } from '@shared/utils/error'
import type MainWindow from './MainWindow'

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
    const { LibraryRepository } = await import('~/db')

    handle('get.libraries', LibraryRepository.getAll.bind(LibraryRepository))
    handle('create.library', LibraryRepository.create.bind(LibraryRepository))
    handle('get.stats', LibraryRepository.getStats.bind(LibraryRepository))

    await (await import('~/libraries/LibraryAdapter')).init()
  },
}
