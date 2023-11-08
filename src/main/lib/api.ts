import { BrowserWindow, dialog, ipcMain } from 'electron'
import { API, APIKey, WindowControlAction } from '@shared/api'
import { CatalogRepository } from '~/catalog'
import { FontInstaller, FontRepository } from '~/fonts'
import search from '~/lib/search'

const handle = <K extends APIKey>(
  channel: K,
  handler: (...params: Parameters<API[K]>) => ReturnType<API[K]>
) => {
  // @ts-ignore: this works
  return ipcMain.handle(channel, (_, ...params) => handler(...params))
}

function handleSelectDirectory(win: BrowserWindow) {
  return async function selectDirectoryHandler() {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    })

    return result.filePaths.at(0)
  }
}

function handleWindow(win: BrowserWindow) {
  return async function windowHandler(state: WindowControlAction) {
    if (state === 'minimize') {
      win.minimize()
    } else if (state === 'close') {
      win.close()
    } else if (state === 'maximize.toggle') {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  }
}

export default {
  async init(win: BrowserWindow) {
    handle('select.directory', handleSelectDirectory(win))
    handle('get.libraries', CatalogRepository.getAllLibraries)
    handle('get.collections', CatalogRepository.getAllCollections)
    handle('get.families', FontRepository.getFamilies)
    handle('get.family', FontRepository.getFamilyByName)
    handle('add.library', CatalogRepository.createLibrary)
    handle('search.fonts', search.search)
    handle('get.stats', CatalogRepository.getCatalogStats)
    handle('install.fonts', FontInstaller.install)
    handle('window.control', handleWindow(win))
  },
}
