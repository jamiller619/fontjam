import sql, { raw } from 'sql-template-tag'
import { Page, Sort } from '@shared/types'

const filters = {
  sort<T>(sort: Sort<T>) {
    return sql`ORDER BY ${raw(String(sort.col))} ${raw(sort.dir)}`
  },
  page(page: Page) {
    return sql`LIMIT ${raw(String(page.index * page.length))}, ${raw(
      String(page.length)
    )}`
  },
}

export default filters
