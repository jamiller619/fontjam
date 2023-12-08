import { DragOverlay, useDndMonitor } from '@dnd-kit/core'
import * as Portal from '@radix-ui/react-portal'
import { Box, ScrollArea } from '@radix-ui/themes'
import { ReactNode, Ref, forwardRef, useMemo, useState } from 'react'
import { css, styled } from 'styled-components'
import { FontFamily } from '@shared/types'
import { Card } from '~/components/card'
import useAppState from '~/hooks/useAppState'

type GridProps = {
  data?: FontFamily[]
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

type ContainerProps = {
  $view: 'grid' | 'list'
}

const Container = styled(Box)<ContainerProps>`
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-3);

  ${({ $view }) => ($view === 'list' ? ListContainer : GridContainer)}
`

const DragOverlayCard = styled(Card)`
  cursor: grabbing;
  background-color: var(--gray-4);

  .preview,
  .footer {
    display: none;
  }
`

function Grid({ data, children }: GridProps, ref: Ref<HTMLDivElement>) {
  const [state] = useAppState()
  const view = state['library.filters.view']
  const [dragData, setDragData] = useState<FontFamily | null>(null)
  const cardStyle = useMemo(() => {
    return {
      minHeight: heights[view],
    }
  }, [view])

  useDndMonitor({
    onDragStart(event) {
      setDragData(event.active.data.current as FontFamily)
    },
    onDragEnd() {
      setDragData(null)
    },
    onDragCancel() {
      setDragData(null)
    },
  })

  return (
    <ScrollArea type="hover" scrollbars="vertical" ref={ref}>
      <Container $view={view}>
        {data?.map((family, i) => (
          <Card
            key={`${family?.name}-${i}`}
            data={family}
            view={view}
            style={cardStyle}
          />
        ))}
        {children}
        <Portal.Root container={document.getElementById('portalContainer')}>
          <DragOverlay>
            {dragData && <DragOverlayCard data={dragData} view={view} />}
          </DragOverlay>
        </Portal.Root>
      </Container>
    </ScrollArea>
  )
}

export default forwardRef<HTMLDivElement, GridProps>(Grid)
