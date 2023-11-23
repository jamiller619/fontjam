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

export type Font = {
  id: number
  familyId: number
  createdAt: number
  fullName: string
  path: string
  postscriptName: string | null
  style: string
  weight: number | null
}

export type FontFamily<T = Font> = {
  id: number
  libraryId: number
  createdAt: number
  name: string
  tags: Tag[] | null
  copyright: string | null
  popularity: number | null
  fonts: T[]
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
