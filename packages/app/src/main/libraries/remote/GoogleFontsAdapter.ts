import logger from 'logger'
import { Font, FontFamily, Library } from '@shared/types'
import { FontRepository } from '~/db'
import Stats from '~/lib/Stats'
import LibraryAdapter from '~/libraries/LibraryAdapter'
import api from './GoogleFontsAPI'
import RemoteAdapter from './RemoteAdapter'
import { Webfont } from './types'

const log = logger('googlefonts.adapter')

function parseVariant(variant: string) {
  const resp = {
    weight: 400,
    style: 'regular',
  }

  if (variant === 'regular') {
    return resp
  }

  if (variant === 'italic') {
    resp.style = 'italic'

    return resp
  }

  const strNum = variant.match(/[0-9]/g)?.join('') ?? ''
  const weight = Number(strNum)
  const style = variant.split(strNum).filter(Boolean).at(0)

  if (!Number.isNaN(weight) && weight > 0) {
    resp.weight = weight
  }

  if (style && style.trim()) {
    resp.style = style.trim()
  }

  return resp
}

function map(libraryId: number) {
  const now = Date.now()

  return function mapFont(popularity: number, webfont: Webfont) {
    const family: Omit<FontFamily, 'id' | 'fonts' | 'tags'> & {
      tags: string | null
      fonts: Omit<Font, 'id' | 'familyId'>[]
    } = {
      libraryId,
      name: webfont.family,
      copyright: null,
      createdAt: now,
      popularity,
      // "webfont.category" appears to be: monospace,
      // sans-serif, etc.
      tags: JSON.stringify([webfont.category]),
      designer: null,
      license: null,
      // API always returns a string that starts with a "v",
      // i.e. "v36", "v12", etc
      version: Number(webfont.version.slice(1)),
      fonts: Object.entries(webfont.files).map(([variant, url]) => {
        const { weight, style } = parseVariant(variant)

        const font: Omit<Font, 'id' | 'familyId'> = {
          style,
          weight,
          createdAt: now,
          path: url as string,
          fullName: `${webfont.family} ${style}`.trim(),
          postscriptName: null,
        }

        return font
      }),
    }

    return family
  }
}

export default class GoogleFontsAdapter
  extends RemoteAdapter
  implements LibraryAdapter
{
  override async search(libraryId: number, query: string) {
    console.log(libraryId, query)
    return [] as FontFamily[]
  }

  override matches(library: Library) {
    return (
      library.type === 'remote' &&
      library.path.startsWith('https://www.googleapis.com/webfonts')
    )
  }

  override async initLibrary(library: Library) {
    const stats = new Stats({
      fontsCount: 0,
      familiesCount: 0,
    })
      .on('start', () => {
        log.info(`Scanning Google Fonts`)
      })
      .on('complete', () => {
        log.info(
          `Finished processing Google Fonts (processed ${stats.state.familiesCount} families and ${stats.state.fontsCount} fonts)`
        )

        this.emit('library.loaded', library)
      })
      .start()

    const resp = await api.request()

    if (!resp) return

    const mapper = map(library.id)

    for await (const font of resp.items) {
      try {
        const family = await FontRepository.findFamilyByName(
          library.id,
          font.family
        )

        if (family != null) {
          continue
        }

        const mapped = mapper(stats.state.familiesCount + 1, font)

        await FontRepository.insertFamily(library.id, mapped)

        stats.update(({ familiesCount, fontsCount }) => ({
          familiesCount: familiesCount + 1,
          fontsCount: fontsCount + mapped.fonts.length,
        }))
      } catch (err) {
        log.error(`Unable to parse Google Font "${font.family}"`, err as Error)
      }
    }

    stats.complete()
  }
}
