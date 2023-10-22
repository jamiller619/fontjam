import path from 'node:path'
import { BrowserWindow, BrowserWindowConstructorOptions, app } from 'electron'

const IS_DEV =
  process.env.NODE_ENV === 'development' || app.isPackaged === false

const windowOptions: BrowserWindowConstructorOptions = {
  height: 800,
  width: 1200,
  frame: false,
  show: false,
  backgroundColor: '#1c1c1c',
  titleBarStyle: 'hidden',
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
    webSecurity: IS_DEV ? false : true,
    preload: path.join(__dirname, 'preload.cjs'),
  },
}

export default class MainWindow extends BrowserWindow {
  constructor() {
    super(windowOptions)
  }

  async show() {
    super.show()

    if (IS_DEV) {
      await this.loadURL('http://localhost:5173')

      this.webContents.openDevTools()
    } else {
      this.loadFile(path.join('dist', 'renderer/index.html'))
    }
  }
}
