import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BrowserWindow, dialog } from 'electron'
import { app } from 'electron'
import { Logger } from '@fontjam/electron-logger'
import { WindowControlAction } from '@shared/api'
import { ConfigStore } from '~/config'

const isDev = process.env.NODE_ENV === 'development' || app.isPackaged === false

const dir = fileURLToPath(new URL('.', import.meta.url))

export default class MainWindow extends BrowserWindow {
  #log: Logger

  constructor(config: ConfigStore, log: Logger) {
    super({
      height: config.get('window.height'),
      width: config.get('window.width'),
      x: config.get('window.x'),
      y: config.get('window.y'),
      frame: false,
      show: false,
      titleBarStyle: 'hidden',
      backgroundMaterial: 'mica',

      webPreferences: {
        preload: path.join(dir, 'preload.cjs'),
      },
    })

    this.#log = log
    this.#log.info(
      `Starting app in ${isDev ? 'development' : 'production'} mode`,
    )
  }

  override async show() {
    if (isDev) {
      this.#log.info(`Loading dev window`)
      await this.loadURL('http://localhost:5173')

      this.#log.info(`Opening dev tools`)
      this.webContents.openDevTools()
    } else {
      await this.loadFile(path.join(dir, '../renderer/index.html'))
    }

    super.show()
  }

  // send<K extends keyof APIEvent>(
  //   channel: K,
  //   ...params: Parameters<APIEvent[K]>
  // ) {
  //   this.webContents.send(channel, ...params)
  // }

  async chooseDirectory() {
    const result = await dialog.showOpenDialog(this, {
      properties: ['openDirectory'],
    })

    return result.filePaths.at(0)
  }

  handleWindow(state: WindowControlAction) {
    if (state === 'minimize') {
      this.minimize()
    } else if (state === 'close') {
      this.close()
    } else if (state === 'maximize.toggle') {
      if (this.isMaximized()) {
        this.unmaximize()
      } else {
        this.maximize()
      }
    }
  }
}
