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
      // backgroundColor: '#1c1c1c',
      titleBarStyle: 'hidden',
      // backgroundMaterial: 'mica',
      titleBarOverlay: {
        color: '#1c1c1c',
        symbolColor: '#fff',
      },
      webPreferences: {
        /**
         * !! important !!
         * This is ONLY disabled in development mode, to allow
         * the loading of images from the dev server.
         */
        // webSecurity: IS_DEV ? false : true,
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
