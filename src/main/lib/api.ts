import { BrowserWindow, dialog, ipcMain } from 'electron'
import { API, APIKey } from '@shared/api'
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

const handleSelectDirectory = (win: BrowserWindow) => {
  return async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    })

    return result.filePaths.at(0)
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
    handle('install.fonts', FontInstaller.install)
  },
}
