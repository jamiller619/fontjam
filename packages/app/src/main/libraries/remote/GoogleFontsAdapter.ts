import process from 'node:process'
import { net } from 'electron'
import logger from 'logger'
import { Font, FontFamily, Library } from '@shared/types'
import { FontRepository } from '~/db'
import LibraryAdapter from '~/libraries/LibraryAdapter'
import RemoteAdapter from './RemoteAdapter'
import { Webfont, WebfontList } from './types/google-fonts'

const log = logger('googlefonts.adapter')

function map(libraryId: number) {
  const now = Date.now()

  return function mapFont(popularity: number, webfont: Webfont) {
    const family: Omit<FontFamily<Omit<Font, 'id' | 'familyId'>>, 'id'> = {
      libraryId,
      name: webfont.family,
      copyright: null,
      createdAt: now,
      popularity,
      tags: null,
      fonts: Object.entries(webfont.files).map(([variant, url]) => {
        const font: Omit<Font, 'id' | 'familyId'> = {
          createdAt: now,
          path: url as string,
          style: variant,
          fullName: `${webfont.family} ${variant}`,
          postscriptName: `${webfont.family}-${variant}`,
          weight: null,
        }

        return font
      }),
    }

    return family
  }
}

async function request<T>(url: string): Promise<T> {
  log.info(`Requesting fonts from Google Fonts...`)

  const response = await net.fetch(
    `${url}&key=${process.env.GOOGLE_FONTS_API_KEY}`
  )

  if (response.ok) {
    const body = await response.json()

    return body
  }

  throw new Error(`Request error: "${response.status}:${response.statusText}"`)
}

export default class GoogleFontsAdapter
  extends RemoteAdapter
  implements LibraryAdapter
{
  async search(libraryId: number, query: string) {
    console.log(libraryId, query)
    return [] as FontFamily[]
  }

  matches(library: Library) {
    return (
      library.type === 'remote' &&
      library.path.startsWith('https://www.googleapis.com/webfonts')
    )
  }

  async initLibrary(library: Library) {
    const url = `${library.path}?sort=popularity`
    const resp = await request<WebfontList>(url)
    const mapper = map(library.id)

    let fontsCount = 0
    let familiesCount = 0

    for await (const font of resp.items) {
      try {
        const family = await FontRepository.findFamilyByName(font.family)

        if (family != null) {
          continue
        }

        const mapped = mapper(familiesCount + 1, font)

        await FontRepository.insertFamily(mapped)

        familiesCount += 1
        fontsCount += mapped.fonts.length
      } catch (err) {
        log.error(`Unable to parse Google Font "${font.family}"`, err as Error)
      }
    }

    log.info(
      `Finished processing Google Fonts (processed ${familiesCount} families and ${fontsCount} fonts)`
    )

    this.emit('library.loaded', library)
  }
}
