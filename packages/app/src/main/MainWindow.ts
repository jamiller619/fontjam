import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BrowserWindow, dialog } from 'electron'
import logger from 'logger'
import { APIEvent, WindowControlAction } from '@shared/api'
import { IS_DEV } from '~/config/constants'

const log = logger('main.window')

log.info(`Starting app in ${IS_DEV ? 'development' : 'production'} mode`)

export default class MainWindow extends BrowserWindow {
  constructor() {
    const dir = fileURLToPath(new URL('.', import.meta.url))

    super({
      height: 800,
      width: 1200,
      frame: false,
      show: false,
      titleBarStyle: 'hidden',

      // The following settings enable the "mica" appearance
      // on Windows, which is quite nice, but is currently
      // riddled with bugs on the electron side.
      // https://github.com/electron/electron/issues/39959
      // transparent: true,
      // backgroundMaterial: 'mica',

      webPreferences: {
        preload: path.join(dir, 'preload.cjs'),
      },
    })
  }

  override async show() {
    if (IS_DEV) {
      log.info(`Loading dev window`)
      await this.loadURL('http://localhost:5173')

      log.info(`Opening dev tools`)
      this.webContents.openDevTools()
    } else {
      await this.loadFile('dist/index.html')
    }

    super.show()
  }

  send<K extends keyof APIEvent>(
    channel: K,
    ...params: Parameters<APIEvent[K]>
  ) {
    this.webContents.send(channel, ...params)
  }

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
