/**
 * Pagination
 * @prop index: The 0-based page index
 * @prop length: The number of records per page
 */
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
