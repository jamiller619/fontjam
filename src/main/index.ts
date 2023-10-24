import path from 'node:path'
import { app } from 'electron'
import logger from 'logger'
import MainWindow from '~/MainWindow'
import { IpcAPI } from './ipc/api'

const log = logger('main.index')

let win: MainWindow | null = null

const onReady = async () => {
  await logger.init(path.join(app.getPath('logs'), 'fontjam.log'))

  log.info('App ready, creating main window')

  win = new MainWindow()

  await win.show()

  const api = new IpcAPI()

  await api.start()
}

app.whenReady().then(onReady)

app.on('window-all-closed', app.quit.bind(app))
