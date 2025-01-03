export type LibraryType = 'local' | 'collection' | 'remote'
export type Tag =
  | 'serif'
  | 'sans-serif'
  | 'display'
  | 'handwriting'
  | 'monospace'

export type Library = {
  id: number
  createdAt: number
  icon: string
  isEditable: 0 | 1
  name: string
  type: LibraryType
  path: string
}

export type FontVariationAxis = {
  tag: string
  name: string
  minValue: number
  defaultValue: number
  maxValue: number
}

export type FontVariationInstance = {
  name: string
  coordinates: Record<string, number>
}

export type FontVariation = {
  axes: FontVariationAxis[]
  instances: FontVariationInstance[]
}

export type Font = {
  createdAt: number
  familyId: number
  fileCreatedAt: number | null
  fileSize: number | null
  fullName: string
  fvar: FontVariation | null
  id: number
  path: string
  postscriptFontName: string | null
  style: string
  // A number value between 1 and 1000, inclusive
  weight: number | null
}

export type BaseFont = Pick<
  Font,
  'fullName' | 'style' | 'postscriptFontName' | 'weight' | 'fvar'
>

export type FontFamily = {
  id: number
  libraryId: number
  createdAt: number
  name: string
  postscriptFamilyName: string | null

  copyright: string | null
  designer: string | null
  license: string | null
  popularity: number | null
  version: number | null

  fonts: Font[]
  tags: string[] | null
}
