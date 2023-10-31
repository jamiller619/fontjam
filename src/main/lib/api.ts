import { BrowserWindow, dialog, ipcMain } from 'electron'
import { API, APIKey } from '@shared/api'
import font from '~/lib/font'
import library from '~/lib/library'

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
  async start(win: BrowserWindow) {
    handle('select.directory', handleSelectDirectory(win))
    handle('get.libraries', library.getAllLibraries.bind(library))
    handle('get.fonts', font.getFamilies.bind(font))
    handle('add.library', library.addLibrary.bind(library))
  },
}
