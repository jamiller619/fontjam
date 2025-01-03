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

type LibraryProps = {
  id: number
}

const DEFAULT_SORT: Sort<FontFamily> = {
  col: 'name',
  dir: 'asc',
}

const CELL_SIZE = {
  grid: {
    width: 200,
    height: 250,
  },
  list: {
    height: 120,
  },
}

const GUTTER_SIZE = 12

type LibraryDataMap = Record<number, FontFamily | undefined> & {
  length: number
}

type DataMap = Record<number, LibraryDataMap>

const dataMap: DataMap = {}

function isItemLoaded(libraryId: number) {
  return function isLoaded(index: number) {
    return dataMap[libraryId][index] != null
  }
}

function loadMoreItems(libraryId: number) {
  return async function load(startIndex: number, stopIndex: number) {
    const length = stopIndex - startIndex

    if (length === 0) return

    const page: Page = {
      length,
      index: Math.round(startIndex / length),
    }

    const data = await window.api['get.families'](libraryId, page, DEFAULT_SORT)

    if (!data || !data.records) {
      console.warn(`get.families returned empty response`)

      return
    }

    for (let i = startIndex; i <= stopIndex; i += 1) {
      dataMap[libraryId][i] = data.records.at(i - startIndex) as FontFamily
    }

    dataMap[libraryId].length = data.total
  }
}

function GridCell(libraryId: number, colCount: number) {
  return function GridCell({
    columnIndex,
    rowIndex,
    style,
  }: GridChildComponentProps<(FontFamily | undefined)[]>) {
    const item = rowIndex * colCount + columnIndex
    const data = dataMap[libraryId][item]

    return (
      <Card
        data={data}
        style={{
          ...style,
          top: Number(style.top) + GUTTER_SIZE,
          left: Number(style.left) + GUTTER_SIZE,
          width: Number(style.width) - GUTTER_SIZE,
          height: Number(style.height) - GUTTER_SIZE,
        }}
      />
    )
  }
}

function ListCell(libraryId: number, width: number) {
  return function ListCell({
    style,
    index,
  }: ListChildComponentProps<(FontFamily | undefined)[]>) {
    const data = dataMap[libraryId][index]

    return (
      <Card
        data={data}
        style={{
          ...style,
          top: Number(style.top) + GUTTER_SIZE,
          left: Number(style.left) + GUTTER_SIZE,
          width: width - GUTTER_SIZE * 2 - 15,
          height: Number(style.height) - GUTTER_SIZE,
        }}
      />
    )
  }
}

export default function Library({ id }: LibraryProps) {
  const libraryFiltersView = useStore((state) => state['library.filters.view'])
  const loader = useMemo(() => loadMoreItems(id), [id])

  if (!dataMap[id]) {
    dataMap[id] = {
      length: 1000,
    }
  }

  const data = dataMap[id]

  return (
    <Fragment>
      <Header />
      <AutoSizer>
        {({ height, width }) => {
          return (
            <InfiniteLoader
              isItemLoaded={isItemLoaded(id)}
              itemCount={data.length}
              minimumBatchSize={20}
              loadMoreItems={loader}>
              {({ onItemsRendered, ref }) => {
                const colCount = Math.floor(width / CELL_SIZE.grid.width)

                if (libraryFiltersView === 'grid') {
                  return (
                    <Grid
                      ref={ref}
                      width={width}
                      height={height - GUTTER_SIZE * 6 - 4}
                      columnCount={colCount}
                      columnWidth={width / colCount - GUTTER_SIZE / 2}
                      rowCount={Math.ceil(data.length / colCount)}
                      rowHeight={CELL_SIZE.grid.height}
                      onItemsRendered={(p) =>
                        onItemsRendered({
                          overscanStartIndex:
                            p.overscanRowStartIndex * colCount,
                          overscanStopIndex: p.overscanRowStopIndex * colCount,
                          visibleStartIndex: p.visibleRowStartIndex * colCount,
                          visibleStopIndex: p.visibleRowStopIndex * colCount,
                        })
                      }>
                      {GridCell(id, colCount)}
                    </Grid>
                  )
                }

                return (
                  <FixedSizeList
                    ref={ref}
                    onItemsRendered={onItemsRendered}
                    itemSize={CELL_SIZE.list.height}
                    itemCount={data.length}
                    height={height}
                    width={width}>
                    {ListCell(id, width)}
                  </FixedSizeList>
                )
              }}
            </InfiniteLoader>
          )
        }}
      </AutoSizer>
    </Fragment>
  )
}
