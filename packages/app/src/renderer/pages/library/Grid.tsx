import { Box, ScrollArea } from '@radix-ui/themes'
import { ReactNode, forwardRef } from 'react'
import { css, styled } from 'styled-components'
import { FontFamily } from '@shared/types'
import { Card } from '~/components/card'
import useAppState from '~/hooks/useAppState'

type GridProps = {
  data?: (FontFamily | undefined)[]
  children?: ReactNode
}

const heights = {
  grid: 200,
  list: 100,
}

const GridContainer = css`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
`

const ListContainer = css`
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`

const Container = styled(Box)<{ $view: 'list' | 'grid' }>`
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-3);

  ${({ $view }) => ($view === 'list' ? ListContainer : GridContainer)}
`

export default forwardRef<HTMLDivElement, GridProps>(function Grid(
  { data, children }: GridProps,
  ref
) {
  const [state] = useAppState()
  const view = state['library.filters.view']

  return (
    <ScrollArea type="hover" scrollbars="vertical" ref={ref}>
      <Container $view={view}>
        {data?.map((family, i) => (
          <Card
            key={`${family?.name}-${i}`}
            data={family}
            height={heights[view]}
            view={view}
          />
        ))}
        {children}
      </Container>
    </ScrollArea>
  )
})
