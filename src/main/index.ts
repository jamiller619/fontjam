import { createReadStream } from 'node:fs'
import path from 'node:path'
import nodeStream from 'node:stream'
import { app, protocol } from 'electron'
import logger from 'logger'
import wait from '@shared/utils/wait'
import MainWindow from './MainWindow'
import { FontRepository } from './fonts'

const log = logger('main.index')

let win: MainWindow | null = null

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'font',
    privileges: {
      standard: true,
      secure: true,
      bypassCSP: true,
      stream: true,
      corsEnabled: true,
      supportFetchAPI: true,
    },
  },
])

const fontProtocolHandler = async (req: Request) => {
  const url = new URL(req.url)

  if (!url.searchParams.has('id')) {
    throw new Error(`Missing required parameter`)
  }

  const id = url.searchParams.get('id')!
  const filePath = await FontRepository.getFilePath(Number(id))

  const stream = createReadStream(filePath)
  const webStream = nodeStream.Readable.toWeb(
    stream
  ) as ReadableStream<ArrayBuffer>

  return new Response(webStream)
}

async function onReady() {
  await logger.init(path.join(app.getPath('logs'), 'fontjam.log'))

  log.info('App ready, creating main window')

  win = new MainWindow()

  const { default: api } = await import('~/lib/api')

  await api.init(win)

  protocol.handle('font', fontProtocolHandler)

  await win.show()

  await wait(2)

  const { LibraryModule, CollectionModule } = await import('~/catalog')
  const { default: search } = await import('~/lib/search')

  await LibraryModule.init()
  await CollectionModule.init()
  await search.init()
}

app.whenReady().then(onReady)

app.on('window-all-closed', app.quit.bind(app))
