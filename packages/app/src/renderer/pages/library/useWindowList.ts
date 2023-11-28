import { RefObject, useEffect, useState } from 'react'
import useScrollPosition from '~/hooks/useScrollPosition'

export default function useWindowList<T extends HTMLElement>(
  ref: RefObject<T>,
  rowHeight: number
) {
  const [page, setPage] = useState(0)
  const top = useScrollPosition(ref, 200)
  const [pageSize, setPageSize] = useState(0)

  useEffect(() => {
    const newPage = Math.floor(top / rowHeight) - 1

    if (newPage !== page) {
      setPage(newPage)
    }
  }, [rowHeight, page, top])

  useEffect(() => {
    if (!ref.current) return

    // const parent = ref.current.parentElement

    // if (!parent) return

    setPageSize(Math.ceil(ref.current.clientHeight / rowHeight) + 1)
  }, [ref, rowHeight])

  return [page, page + pageSize] as const
}
