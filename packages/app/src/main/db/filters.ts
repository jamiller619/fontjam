import sql, { raw } from 'sql-template-tag'
import { Page, Paged, Sort } from '@shared/types'

const filters = {
  sort<T>(sort: Sort<T>) {
    return sql`ORDER BY ${raw(String(sort.col))} ${raw(sort.dir.toUpperCase())}`
  },
  page(page: Page) {
    return sql`LIMIT ${raw(String(page.length))} OFFSET ${raw(
      String(page.index * page.length),
    )}`
  },
}

export default filters

export function createPagedResponse<T>(
  total: number,
  index: number,
  records: T[],
) {
  const resp: Paged<T> = {
    total,
    records,
    index,
    length: records.length,
  }

  return resp
}
