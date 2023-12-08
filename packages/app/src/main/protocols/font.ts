import { createReadStream } from 'node:fs'
import stream from 'node:stream'
import { net, protocol } from 'electron'

function setHeaders(resp: Response) {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 1)

  resp.headers.set('Expires', date.toUTCString())
  resp.headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return resp
}

async function downloadFont(url: string) {
  const req = await net.fetch(url)
  const response = new Response(await req.arrayBuffer())

  return setHeaders(response)
}

function downloadLocalFont(path: string) {
  const reader = createReadStream(path)
  const webStream = stream.Readable.toWeb(reader) as ReadableStream<ArrayBuffer>

  const response = new Response(webStream)

  return setHeaders(response)
}

function isRemote(str: string) {
  return str.startsWith('http')
}

protocol.handle('font', async (req: Request) => {
  const { default: ReadRepository } = await import('~/db/ReadRepository')
  const { default: connect } = await import('~/db/connect')
  const url = new URL(req.url)

  if (!url.searchParams.has('id')) {
    throw new Error(`Missing required parameter`)
  }

  const id = url.searchParams.get('id')
  const font = await ReadRepository.getFont(connect(), Number(id))

  if (!font) {
    throw new Error(`Unable to find a font with that id: "${id}"`)
  }

  if (isRemote(font.path)) {
    return downloadFont(font.path)
  }

  return downloadLocalFont(font.path)
})
