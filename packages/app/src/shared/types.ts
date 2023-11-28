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

export type BaseFont = {
  fullName: string
  style: string

  postscriptName: string | null
  // A number value between 1 and 1000, inclusive
  weight: number | null
}

export type Font = BaseFont & {
  id: number
  familyId: number
  createdAt: number
  path: string
}

export type BaseFontFamily = {
  fonts: BaseFont[]
  name: string

  copyright: string | null
  designer: string | null
  license: string | null
  popularity: number | null
  tags: string | null
  version: number | null
}

export type FontFamily = Omit<BaseFontFamily, 'fonts' | 'tags'> & {
  id: number
  libraryId: number
  createdAt: number
  fonts: Font[]
  tags: string[] | null
}

// export type FontFamily<T extends SharedFont = Font> = SharedFontFamily<T> & {
//   id: number
//   libraryId: number
//   createdAt: number
// }

export type OptionalId<T extends { id: number }> = Omit<T, 'id'> & {
  id?: number
}

export type Page = {
  index: number
  length: number
}

export type Paged<T> = Page & {
  total: number
  records: T[]
}

export type Sort<T> = {
  dir: 'asc' | 'desc'
  col: keyof T
}
