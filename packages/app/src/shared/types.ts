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

export type BaseFont = {
  fullName: string
  style: string

  postscriptName: string | null
  // A number value between 1 and 1000, inclusive
  weight: number | null

  fvar: FontVariation | null
}

export type Font = BaseFont & {
  id: number
  familyId: number
  createdAt: number
  fileCreatedAt: number | null
  path: string
}

export type FontFamily = {
  id: number
  libraryId: number
  createdAt: number
  name: string

  copyright: string | null
  designer: string | null
  license: string | null
  popularity: number | null
  version: number | null

  fonts: Font[]
  tags: string[] | null
}

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
