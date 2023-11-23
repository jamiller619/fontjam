import { createReadStream } from 'node:fs'
import stream from 'node:stream'
import { protocol } from 'electron'

protocol.handle('font', async (req: Request) => {
  const { FontRepository } = await import('~/db')
  const url = new URL(req.url)

  if (!url.searchParams.has('id')) {
    throw new Error(`Missing required parameter`)
  }

  const id = url.searchParams.get('id')
  const font = await FontRepository.findById(Number(id))

  if (!font) {
    throw new Error(`Unable to find a font with that id: "${id}"`)
  }

  const reader = createReadStream(font.path)
  const webStream = stream.Readable.toWeb(reader) as ReadableStream<ArrayBuffer>

  return new Response(webStream)
})
