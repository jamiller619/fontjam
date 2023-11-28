import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { net } from 'electron'
import logger from 'logger'
import { paths } from '~/config'
import { WebfontList } from './types'

const log = logger('googlefonts.api')

const BASE_URL = 'https://www.googleapis.com/webfonts/v1/webfonts'
const TTL = 1000 * 60 * 60 * 24 * 5 // 5 days

type Cache = {
  list: WebfontList
  date: number
}

const CACHE_FILE = path.normalize(`${paths.data}/cache/google-fonts.json`)

await fs.mkdir(path.dirname(CACHE_FILE), {
  recursive: true,
})

async function loadCache() {
  return JSON.parse(await fs.readFile(CACHE_FILE, 'utf-8')) as Cache
}

async function getCache() {
  try {
    const cache = await loadCache()
    const diff = Date.now() - cache.date

    if (diff > TTL) {
      return undefined
    }

    return cache
  } catch {
    return undefined
  }
}

async function setCache(data: WebfontList) {
  const cache: Cache = {
    list: data,
    date: Date.now(),
  }

  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2))
}

export default {
  async request() {
    const cache = await getCache()

    if (cache != null) {
      return cache.list
    }

    try {
      log.info(`Requesting fonts from Google Fonts...`)

      const response = await net.fetch(
        `${BASE_URL}?sort=popularity&key=${process.env.GOOGLE_FONTS_API_KEY}`
      )

      if (response.ok) {
        const body: WebfontList = await response.json()

        await setCache(body)

        return body
      }

      throw new Error(
        `Request error: "${response.status}:${response.statusText}"`
      )
    } catch (err) {
      log.error(`Google Fonts API request failed`, err as Error)

      return undefined
    }
  },
}
