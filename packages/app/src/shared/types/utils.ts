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

export type OptionalId<T extends { id: number }> = Omit<T, 'id'> & {
  id?: number
}
