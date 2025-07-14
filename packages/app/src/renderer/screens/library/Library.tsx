import { Fragment, useMemo } from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import {
  FixedSizeList,
  FixedSizeGrid as Grid,
  GridChildComponentProps,
  ListChildComponentProps,
} from 'react-window'
import InfiniteLoader from 'react-window-infinite-loader'
import { FontFamily } from '@shared/types/dto'
import { Page, Sort } from '@shared/types/utils'
import { Card } from '~/components/card'
import { useStore } from '~/store'
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
  grid: { width: 200, height: 250 },
  list: { height: 120 },
}

// Space around each card
const GUTTER = 12

// Structure for storing paginated data for a library
type LibraryDataMap = Record<number, FontFamily | undefined> & {
  length: number
}

// Global in-memory map of library data by library ID
const dataMap: Record<number, LibraryDataMap> = {}

/**
 * Ensure the data map exists for the given library ID.
 */
function ensureLibraryData(libraryId: number): LibraryDataMap {
  if (!dataMap[libraryId]) {
    dataMap[libraryId] = { length: 1000 }
  }
  return dataMap[libraryId]
}

/**
 * Check whether a specific item index has been loaded.
 */
function isItemLoaded(libraryId: number) {
  return function isItemLoadedFn(index: number): boolean {
    return dataMap[libraryId][index] != null
  }
}

/**
 * Load a page of font family data from the backend.
 */
function loadMoreItems(libraryId: number) {
  return async function loadMoreItemsFn(start: number, stop: number) {
    const length = stop - start
    if (length === 0) return

    const page: Page = {
      length,
      index: Math.floor(start / length),
    }

    const result = await window.api['get.families'](
      libraryId,
      page,
      DEFAULT_SORT,
    )

    if (!result?.records) {
      console.warn('get.families returned empty response')
      return
    }

    const items = result.records

    for (let i = start; i <= stop; i++) {
      dataMap[libraryId][i] = items[i - start]
    }

    dataMap[libraryId].length = result.total
  }
}

/**
 * Calculate consistent card styling with gutter.
 */
function getCellStyle(
  style: React.CSSProperties,
  width: number,
  height?: number,
): React.CSSProperties {
  return {
    ...style,
    top: Number(style.top) + GUTTER,
    left: Number(style.left) + GUTTER,
    width: width - GUTTER * 2 - 15,
    height: height != null ? height - GUTTER : Number(style.height) - GUTTER,
  }
}

/**
 * Grid renderer function for a single card.
 */
function GridCellRenderer(libraryId: number, colCount: number) {
  const GridCell = function GridCell({
    columnIndex,
    rowIndex,
    style,
  }: GridChildComponentProps) {
    const index = rowIndex * colCount + columnIndex
    const data = dataMap[libraryId][index]

    return (
      <Card
        data={data}
        style={getCellStyle(style, Number(style.width), Number(style.height))}
      />
    )
  }

  GridCell.displayName = 'GridCellRenderer'

  return GridCell
}

/**
 * List renderer function for a single card.
 */
function ListCellRenderer(libraryId: number, width: number) {
  const ListCell = function ListCell({
    index,
    style,
  }: ListChildComponentProps) {
    const data = dataMap[libraryId][index]

    return <Card data={data} style={getCellStyle(style, width)} />
  }

  ListCell.displayName = 'ListCellRenderer'

  return ListCell
}

/**
 * Main Library component for rendering a virtualized list or grid of font families.
 */
export default function Library({ id }: LibraryProps) {
  // Read the view mode ('grid' or 'list') from Zustand store
  const viewMode = useStore((state) => state['library.filters.view'])

  // Memoize loader function to avoid recreating on each render
  const loader = useMemo(() => loadMoreItems(id), [id])

  // Ensure we have a data structure for the current library
  const libraryData = ensureLibraryData(id)

  return (
    <Fragment>
      <Header />
      <AutoSizer>
        {({ height, width }) => {
          const colCount = Math.floor(width / CELL_SIZE.grid.width)

          return (
            <InfiniteLoader
              isItemLoaded={isItemLoaded(id)}
              itemCount={libraryData.length}
              loadMoreItems={loader}
              minimumBatchSize={20}>
              {({ onItemsRendered, ref }) =>
                viewMode === 'grid' ? (
                  <Grid
                    ref={ref}
                    width={width}
                    height={height - GUTTER * 6 - 4}
                    columnCount={colCount}
                    columnWidth={width / colCount - GUTTER / 2}
                    rowCount={Math.ceil(libraryData.length / colCount)}
                    rowHeight={CELL_SIZE.grid.height}
                    onItemsRendered={({
                      overscanRowStartIndex,
                      overscanRowStopIndex,
                      visibleRowStartIndex,
                      visibleRowStopIndex,
                    }) =>
                      onItemsRendered({
                        overscanStartIndex: overscanRowStartIndex * colCount,
                        overscanStopIndex: overscanRowStopIndex * colCount,
                        visibleStartIndex: visibleRowStartIndex * colCount,
                        visibleStopIndex: visibleRowStopIndex * colCount,
                      })
                    }>
                    {GridCellRenderer(id, colCount)}
                  </Grid>
                ) : (
                  <FixedSizeList
                    ref={ref}
                    onItemsRendered={onItemsRendered}
                    itemCount={libraryData.length}
                    itemSize={CELL_SIZE.list.height}
                    width={width}
                    height={height}>
                    {ListCellRenderer(id, width)}
                  </FixedSizeList>
                )
              }
            </InfiniteLoader>
          )
        }}
      </AutoSizer>
    </Fragment>
  )
}
