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

export type OptionalId<T extends { id: string }> = Omit<T, 'id'> & {
  id: string
}

export type AllowNullableKeys<T, K extends keyof T> = Omit<T, K> & {
  [P in K]?: T[P] | null | undefined
}
