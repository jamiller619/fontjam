import path from 'node:path'
import { parse } from 'dotenv'
import { Menu, app } from 'electron'
import logger from 'logger'
import { formatMs } from '@shared/utils/datetime'
import api from '~/api'
import ReadRepository from '~/db/ReadRepository'
import connect from '~/db/connect'
import * as protocols from '~/protocols'
import registerProtocolSchemes from '~/protocols/registerSchemes'
import initProviders from '~/providers/init'
import env from '../../.env'
import MainWindow from './MainWindow'

Object.assign(process.env, {
  ...parse(env),
})

const start = Date.now()
const log = logger('app.index')

let win: MainWindow | null = null

// https://github.com/electron/electron/issues/35512
Menu.setApplicationMenu(null)

registerProtocolSchemes()

async function onReady() {
  const startTime = Date.now() - start
  const conn = connect()

  await logger.init(path.join(app.getPath('logs'), 'fontjam.log'))

  log.info('App ready, creating main window')

  win = new MainWindow()

  api.init(win)

  await protocols.init()
  await api.start(conn)

  await win.show()

  const libraries = await ReadRepository.getLibraries(conn)

  await initProviders(libraries)

  win.send('startup.complete', startTime)

  log.info(`Startup complete in ${formatMs(startTime)}s`)
}

app.whenReady().then(onReady)

app.on('window-all-closed', app.quit.bind(app))
