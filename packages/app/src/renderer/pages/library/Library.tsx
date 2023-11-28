// import { Flex } from '@radix-ui/themes'
import { Fragment, RefObject, useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
// import styled from 'styled-components'
import useScrollPosition from '~/hooks/useScrollPosition'
import { useFamilies } from '~/hooks/userLibrary'
// import { fadein } from '~/style/keyframes'
import { clamp } from '~/utils/number'
import Grid from './Grid'
import Header from './Header'

type LibraryProps = {
  id: number
}

// const NoResultsContainer = styled(Flex)`
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   width: 100%;
//   height: 60vh;
//   margin-top: var(--space-5);
//   animation: 150ms 150ms ease-out both ${fadein};

//   svg {
//     width: 30vw;
//   }
// `

type UseWindowedFamiliesOptions<T extends HTMLElement> = {
  ref: RefObject<T>
  totalItems?: number
  itemHeight: number
  windowRows: number
}

function useWindowedList<T extends HTMLElement>({
  ref,
  totalItems,
  itemHeight,
  windowRows,
}: UseWindowedFamiliesOptions<T>) {
  const [[start, end], setState] = useState([0, windowRows])
  const top = useScrollPosition(ref, 200)

  useEffect(() => {
    const clampValue = (num: number) => {
      return clamp(num, 0, totalItems ?? 0)
    }

    const newStart = clampValue(Math.floor(top / itemHeight))

    if (newStart !== start) {
      const newEnd = windowRows + newStart

      setState([newStart, clampValue(newEnd)])
    }
  }, [itemHeight, start, top, totalItems, windowRows])

  return [start, end]
}

const PAGE_SIZE = 36

function useWindowedFamilies(libraryId: number, ref: RefObject<HTMLElement>) {
  const [page] = useState(0)
  const data = useFamilies(page, PAGE_SIZE, libraryId)
  const virtual = new Array(data?.total).fill(undefined)
  const [start, end] = useWindowedList({
    ref,
    totalItems: data?.total ? Math.ceil(data.total / 4) : 0,
    itemHeight: 200,
    windowRows: 4,
  })

  return virtual.map((_, i) =>
    i >= start * 4 && i < end * 4 ? data?.records.at(i) : undefined
  )
}

export default function Library({ id }: LibraryProps) {
  const { ref: pageRef } = useInView({
    threshold: 0,
  })
  const scrollRef = useRef(null)
  const data = useFamilies(0, PAGE_SIZE, id)?.records
  // const data = useWindowedFamilies(id, scrollRef)

  return (
    <Fragment>
      <Header />
      <Grid data={data} ref={scrollRef}>
        <div ref={pageRef} />
      </Grid>
    </Fragment>
  )
}
