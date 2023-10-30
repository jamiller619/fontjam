import path from 'node:path'
import { app } from 'electron'
import logger from 'logger'
import api from '~/lib/api'
import library from '~/lib/library'
import MainWindow from '~/win/MainWindow'

const log = logger('main.index')

let win: MainWindow | null = null

async function onReady() {
  await logger.init(path.join(app.getPath('logs'), 'fontjam.log'))

  log.info('App ready, creating main window')

  win = new MainWindow()

  await win.show()

  log.info('MainWindow ready, starting api')

  await api.start(win)
  await library.start()
}

app.whenReady().then(onReady)

app.on('window-all-closed', app.quit.bind(app))
