import path from 'node:path'
import process from 'node:process'
import { BrowserWindow, app } from 'electron'
import logger from 'logger'
import wait from '@shared/utils/wait'

const log = logger('main')

const IS_DEV =
  process.env.NODE_ENV === 'development' || app.isPackaged === false

log.info(`Starting app in ${IS_DEV ? 'development' : 'production'} mode`)

export default class MainWindow extends BrowserWindow {
  constructor() {
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
        preload: path.join(__dirname, 'preload.js'),
      },
    })
  }

  async show() {
    super.show()

    if (IS_DEV) {
      log.info(`Loading dev window`)
      await this.loadURL('http://localhost:5173')

      await wait(1)

      log.info(`Opening dev tools`)
      this.webContents.openDevTools()
    } else {
      this.loadFile(path.join('dist', 'renderer/index.html'))
    }
  }
}
