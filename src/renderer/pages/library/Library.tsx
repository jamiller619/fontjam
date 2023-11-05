import { Box, Flex, Portal, ScrollArea, Text } from '@radix-ui/themes'
import { Fragment, useEffect, useState } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useIsMounted } from 'usehooks-ts'
import { Card } from '~/components/card'
import { Toolbar } from '~/components/toolbar'
import { useSearch } from '~/components/toolbar/Search'
import useAPI from '~/hooks/useAPI'
import useScrollPosition from '~/hooks/useScrollPosition'
import { fadein } from '~/style/keyframes'
import NoResults from './NoResults'

type LibraryProps = {
  id?: number
}

const Grid = styled(Box)`
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-3);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
`

const NoResultsContainer = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60vh;
  margin-top: var(--space-5);
  animation: 150ms 150ms ease-out both ${fadein};

  svg {
    width: 30vw;
  }
`

const useLibraryId = (id?: number) => {
  const params = useParams()

  return id ?? Number(params.id) ?? 1
}

const CARD_HEIGHT = 220
const CARD_WIDTH = 200

export default function Library(props: LibraryProps) {
  const id = useLibraryId(props.id)
  const [searchText] = useSearch()
  const isMounted = useIsMounted()
  const [ref, scrollY] = useScrollPosition()
  const [visibleRange, setVisibleRange] = useState([0, 0])

  useEffect(() => {
    if (!ref.current) return

    const parentNode = ref.current.parentNode as HTMLElement

    if (!parentNode) return

    const visibleRows = Math.ceil(parentNode.clientHeight / CARD_HEIGHT)
    const visibleColumns = Math.floor(ref.current?.clientWidth / CARD_WIDTH)
    const visibleRowStartIndex = Math.floor(scrollY / CARD_HEIGHT)
    const start = visibleRowStartIndex * visibleColumns - visibleColumns
    const end = start - 1 + visibleRows * visibleColumns + visibleColumns

    setVisibleRange([start, end])
  }, [ref, scrollY])

  const { data: apiData } = useAPI(
    'get.families',
    [Number(id), { index: 0, length: 48 }],
    {
      refreshWhenHidden: false,
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )

  const [data, setData] = useState(apiData?.records)

  useEffect(() => {
    if (searchText) {
      window.api['search.fonts'](Number(id), searchText)
        .then((res) => {
          if (isMounted()) {
            setData(res.map((r) => r.item))
          }
        })
        .catch(console.error)
    } else {
      setData(apiData?.records)
    }
  }, [apiData?.records, id, isMounted, searchText])

  const el = document.querySelector(
    '[data-is-root-theme="true"]'
  ) as HTMLElement | null

  return (
    <Fragment>
      <Toolbar />
      <ScrollArea type="hover" scrollbars="vertical" ref={ref}>
        {data && data.length > 0 ? (
          <Grid>
            {data.map((family, i) => (
              <Card
                isVisible={i >= visibleRange[0] && i <= visibleRange[1]}
                key={family.name}
                data={family}
                height={CARD_HEIGHT}
              />
            ))}
          </Grid>
        ) : (
          <NoResultsContainer>
            <Text size="3">No results!</Text>
            <NoResults />
          </NoResultsContainer>
        )}
      </ScrollArea>
      <Portal container={el}>
        <Outlet />
      </Portal>
    </Fragment>
  )
}
