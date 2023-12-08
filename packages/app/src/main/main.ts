import path from 'node:path'
import { Menu, app } from 'electron'
import logger from 'logger'
import { formatMs } from '@shared/utils/datetime'
import api from '~/api'
import registerProtocolSchemes from '~/protocols/registerSchemes'
import MainWindow from './MainWindow'

const start = Date.now()
const log = logger('app.index')

let win: MainWindow | null = null

// https://github.com/electron/electron/issues/35512
Menu.setApplicationMenu(null)

registerProtocolSchemes()

async function onReady() {
  await logger.init(path.join(app.getPath('logs'), 'fontjam.log'))

  const protocols = await import('~/protocols')

  log.info('App ready, creating main window')

  win = new MainWindow()

  api.init(win)

  await protocols.init()
  await win.show()
  await api.start()

  const startTime = Date.now() - start

  win.send('startup.complete', startTime)

  log.info(`Startup complete in ${formatMs(startTime)}s`)
}

app.whenReady().then(onReady)

app.on('window-all-closed', app.quit.bind(app))
