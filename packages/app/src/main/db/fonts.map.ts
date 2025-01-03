import { Font, FontFamily } from '@shared/types/dto'
import groupBy from '@shared/utils/groupBy'
import { titleCase } from '@shared/utils/string'
import type { FontFamilyJoinQueryRow } from './ReadRepository'

const styleRanks = ['regular', 'medium', 'demi', 'mono', 'book', 'icons']

function scoreWeight(weight: number | null) {
  if (weight == null) {
    return 0
  }

  return 1000 - Math.abs(400 - weight) / 1000
}

function scoreStyle(style: string) {
  const lower = style.toLowerCase()
  const idx = styleRanks.toReversed().findIndex((s) => lower.includes(s))
  const rank = (idx + 1) / styleRanks.length

  return rank
}

function generateSortRank(font: Font) {
  const weight = scoreWeight(font.weight)
  const style = scoreStyle(font.style)

  return weight / 2 + style / 2
}

function sortFonts(a: Font, b: Font) {
  const sa = generateSortRank(a)
  const sb = generateSortRank(b)

  return sb - sa
}

export function mapFontFamilyJoinQuery(...data: FontFamilyJoinQueryRow[]) {
  const families = groupBy(data, (d) => String(d.id))

  return Object.values(families).map((rows) => {
    const ref = rows.at(0)!

    const family: FontFamily = {
      id: ref.id,
      copyright: ref.copyright,
      createdAt: ref.createdAt,
      libraryId: ref.libraryId,
      name: ref.name,
      postscriptFamilyName: ref.postscriptFamilyName,
      popularity: ref.popularity,
      tags: ref.tags ? JSON.parse(ref.tags) : null,
      designer: ref.designer,
      license: ref.license,
      version: ref.version,
      fonts: rows
        .map((row) => ({
          createdAt: row.fontCreatedAt,
          familyId: ref.id,
          fullName: row.fullName,
          id: row.fontId,
          path: row.path,
          postscriptFontName: row.postscriptFontName,
          style: titleCase(row.style),
          weight: row.weight,
          fvar: row.fvar ? JSON.parse(row.fvar) : null,
          fileCreatedAt: row.fileCreatedAt,
          fileSize: row.fileSize,
        }))
        .sort(sortFonts),
    }

    return family
  })
}
