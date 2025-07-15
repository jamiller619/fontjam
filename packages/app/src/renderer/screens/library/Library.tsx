import { ScrollArea } from '@radix-ui/themes'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { FontFamily } from '@shared/types/dto'
import { Page, Sort } from '@shared/types/utils'
import { Card } from '~/components/card'
import Header from './Header'

// Props for the Library component
type LibraryProps = {
  id: number
}

// Default sorting configuration for font families
const DEFAULT_SORT: Sort<FontFamily> = {
  col: 'name',
  dir: 'asc',
}

// Dimensions for grid and list cells
const CELL_SIZE = {
  grid: { width: 220, height: 250 },
  list: { height: 120 },
}

// Space around each card
const GUTTER = 12

function loadFamilies(libraryId: number) {
  return async function loadFamiliesFn(page: Page, sort: Sort<FontFamily>) {
    const result = await window.api['get.families'](libraryId, page, sort)

    return {
      records: result?.records,
      total: result?.total,
    }
  }
}

/**
 * Main Library component for rendering a virtualized list or grid of font families.
 */
export default function Library({ id }: LibraryProps) {
  // Read the view mode ('grid' or 'list') from Zustand store
  // const viewMode = useStore((state) =>
  // state['library.filters.view'])
  const ref = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const pageSize = 20
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
  const containerWidth = ref?.current?.clientWidth ?? 1000
  const colCount = Math.floor(containerWidth / (CELL_SIZE.grid.width + GUTTER))
  const [data, setData] = useState<FontFamily[]>([])
  const [totalRecords, setTotalRecords] = useState(pageSize)
  const loadItems = useMemo(() => loadFamilies(id), [id])
  const hasNextPage = totalRecords > data.length

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(totalRecords / colCount),
    getScrollElement: () => ref.current,
    estimateSize: () => CELL_SIZE.grid.height + GUTTER,
    overscan: 5,
  })

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: colCount,
    getScrollElement: () => ref.current,
    estimateSize: () => CELL_SIZE.grid.width + GUTTER,
    overscan: 5,
  })

  const items = rowVirtualizer.getVirtualItems()

  useEffect(() => {
    const lastItem = items.at(-1)

    if (!lastItem) return

    if (
      lastItem.index * colCount + colCount >= page * pageSize - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      setIsFetchingNextPage(true)

      loadItems({ index: page, length: pageSize }, DEFAULT_SORT).then(
        (result) => {
          if (result?.records && result.total) {
            const newData = result.records

            setTotalRecords(result.total)
            setPage((prev) => prev + 1)
            setData((prev) => [...prev, ...newData])
          } else {
            console.warn('No records returned from loadItems')
          }

          window.setTimeout(() => {
            setIsFetchingNextPage(false)
          }, 200)
        },
      )
    }
  }, [colCount, hasNextPage, isFetchingNextPage, items, loadItems, page])

  return (
    <Fragment>
      <Header />
      <ScrollArea ref={ref} scrollbars="vertical">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: `${columnVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}>
          {items.map((row) =>
            columnVirtualizer.getVirtualItems().map((col) => {
              const itemData = data[row.index * colCount + col.index]

              return (
                <div
                  key={col.key}
                  style={{
                    position: 'absolute',
                    top: GUTTER,
                    left: GUTTER,
                    width: `${col.size}px`,
                    height: `${row.size}px`,
                    transform: `translateX(${col.start}px) translateY(${row.start}px)`,
                  }}>
                  <Card
                    key={col.key}
                    data={itemData}
                    style={{
                      width: col.size - GUTTER,
                      height: row.size - GUTTER,
                    }}
                  />
                </div>
              )
            }),
          )}
        </div>
      </ScrollArea>
    </Fragment>
  )
}
