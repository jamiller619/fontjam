import { net } from 'electron'
import EventEmitter from 'events'
import logger from 'logger'
import TypedEmitter from 'typed-emitter'
import { Library } from '@shared/types'
import { formatMs } from '@shared/utils/datetime'
import { FontRepository } from '~/db'
import { BaseFamilyWithFontPaths } from '~/db/FontRepository'
import Stats from '~/lib/Stats'
import * as FontFileParser from '~/libraries/FontFileParser'

type EventMap = {
  'scan.complete'(library: Library): unknown
}

const log = logger('github.scanner')
const emitter = new EventEmitter() as TypedEmitter<EventMap>

type GitTree = {
  path: string
  mode: string
  type: 'tree' | 'blob'
  sha: string
  size: number
  url: string
}

type GitTreeResponse = {
  sha: string
  url: string
  tree: GitTree[]
}

type BlobResponse = {
  sha: string
  node_id: string
  size: number
  url: string
  content: string
  encoding: BufferEncoding
}

function addHeaders(request: Request) {
  request.headers.set('Accept', 'application/vnd.github+json')
  request.headers.set('X-GitHub-Api-Version', '2022-11-28')

  return request
}

async function requestBlob(url: string) {
  const request = addHeaders(new Request(url))
  const resp = await net.fetch(request)

  if (resp.ok) {
    return resp.json() as Promise<BlobResponse>
  }
}

async function requestTree(owner: string, repo: string, sha: string) {
  const request = addHeaders(
    new Request(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=true`
    )
  )

  log.info(`Requesting tree from Github...`)

  const resp = await net.fetch(request)

  log.info(`Rec'd response status: ${resp.status}`)

  if (resp.ok) {
    const data = await resp.json()

    return data as GitTreeResponse
  }
}

const exts = ['.otf', '.ttf', '.woff', '.woff2']

async function parseFonts(data: GitTreeResponse) {
  const fonts: Omit<
    BaseFamilyWithFontPaths,
    'id' | 'libraryId' | 'createdAt'
  >[] = []

  for await (const obj of data.tree) {
    if (obj.type !== 'blob') continue

    if (exts.some((ext) => obj.path.endsWith(ext))) {
      const blob = await requestBlob(obj.url)

      if (!blob) {
        log.warn(`Unable to parse "${obj.path}"`)

        continue
      }

      const parsed = FontFileParser.parse(
        obj.path,
        Buffer.from(blob.content, blob.encoding)
      )

      if (parsed) fonts.push(parsed)
    }
  }

  return fonts
}

export async function scanRepo(library: Library) {
  const [owner, repo] = library.path.replace('github://', '').split('/')

  const stats = new Stats({
    familiesAdded: 0,
  })
    .on('start', () => {
      log.info(
        `Scanning remote Github library "${library.name}" repo ${owner}/${repo}`
      )
    })
    .on('complete', () => {
      log.info(
        `Added ${stats.state?.familiesAdded} font families to ${
          library.name
        } in ${formatMs(stats.duration)}s`
      )

      emitter.emit('scan.complete', library)
    })
    .start()

  //TODO: the third parameter should NOT be hardcoded
  const tree = await requestTree(owner, repo, 'main')

  if (tree != null) {
    const fonts = await parseFonts(tree)

    const families = FontFileParser.parseList(fonts)

    for await (const family of families) {
      await FontRepository.upsertFamily(library.id, family)

      stats.update(({ familiesAdded }) => ({
        familiesAdded: familiesAdded + 1,
      }))
    }
  }

  stats.complete()
}
