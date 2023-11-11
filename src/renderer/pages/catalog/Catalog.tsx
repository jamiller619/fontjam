import { Flex, Portal, Text } from '@radix-ui/themes'
import { Fragment, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { useIsMounted } from 'usehooks-ts'
import { Family } from '@shared/types'
import { Toolbar } from '~/components/toolbar'
import { useSearch } from '~/components/toolbar/Search'
import useAppState from '~/hooks/useAppState'
import { useFamilies } from '~/hooks/useCatalog'
import { fadein } from '~/style/keyframes'
import Grid from './Grid'
import NoResults from './NoResults'

type LibraryProps = {
  id?: number
}

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

type State = {
  [catalogId: number]: {
    [page: number]: Family[]
  }
}

export default function Catalog(props: LibraryProps) {
  const [page, setPage] = useState(0)
  const [families, id] = useFamilies(page, 48, props.id)
  const [data, setData] = useState<State>({ [id]: {} })
  const { ref, inView } = useInView()

  useEffect(() => {
    if (families?.length && data[id]?.[page] == null) {
      setData((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          [page]: families,
        },
      }))
    }
  }, [data, families, page, id])

  useEffect(() => {
    if (inView && data[id]?.[page + 1] == null && data[id]?.[page] != null) {
      setPage((prev) => prev + 1)
    }
  }, [data, inView, page, id])

  // const [data, setData] = useState(families)
  // const [searchText] = useSearch()
  // const isMounted = useIsMounted()

  // useEffect(() => {
  //   if (searchText) {
  //     window.api['search.fonts'](id, searchText)
  //       .then((res) => {
  //         if (isMounted()) {
  //           setData(res.map((r) => r.item))
  //         }
  //       })
  //       .catch(console.error)
  //   } else {
  //     setData(families)
  //   }
  // }, [families, id, isMounted, searchText])

  // const el = document.querySelector(
  //   '[data-is-root-theme="true"]'
  // ) as HTMLElement | null

  return (
    <Fragment>
      <Toolbar />
      {Object.keys(data[id] ?? {}).length > 0 ? (
        <Grid data={Object.values(data[id]).flat()}>
          <div ref={ref} />
        </Grid>
      ) : (
        <NoResultsContainer>
          <Text size="3">No results!</Text>
          <NoResults />
        </NoResultsContainer>
      )}
      {/* <Portal container={el}>
        <Outlet />
      </Portal> */}
    </Fragment>
  )
}
