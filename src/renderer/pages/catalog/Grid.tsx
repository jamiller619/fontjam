import { Box, ScrollArea } from '@radix-ui/themes'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { css, styled } from 'styled-components'
import { useElementSize } from 'usehooks-ts'
import { Family } from '@shared/types'
import { Card } from '~/components/card'
import useAppState from '~/hooks/useAppState'
import useWindowList from './useWindowList'

type GridProps = {
  data?: Family[]
  children?: ReactNode
}

const HEIGHTS = {
  grid: 200,
  list: 100,
}

const Container = styled(Box)<{ $view: 'list' | 'grid' }>`
  ${({ $view }) =>
    $view === 'list'
      ? css`
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        `
      : css`
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-3);
        `}
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-3);
  background: linear-gradient(135deg, var(--gray-a2) 20%, var(--gray-a1) 80%);
`

export default function Grid({ data, children }: GridProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [cols, setCols] = useState(0)
  const [cardRef, { width, height }] = useElementSize()
  const visibleRange = useWindowList(ref, height)
  const [state] = useAppState()
  const view = state['catalog.filters.view']

  useEffect(() => {
    if (width && ref.current?.parentElement) {
      setCols(Math.floor(ref.current.parentElement.clientWidth / width))
    }
  }, [width])

  return (
    <ScrollArea type="hover" scrollbars="vertical" ref={ref}>
      <Container $view={view}>
        {data?.map((family, i) => (
          <Card
            isVisible={
              i >= visibleRange[0] * cols && i < visibleRange[1] * cols
            }
            key={family.name}
            data={family}
            height={HEIGHTS[view]}
            ref={i === 0 ? cardRef : null}
            view={view}
          />
        ))}
        {children}
      </Container>
    </ScrollArea>
  )
}
