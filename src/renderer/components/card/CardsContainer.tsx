import { Flex } from '@radix-ui/themes'
import { HTMLAttributes, ReactNode } from 'react'
import { styled } from 'styled-components'

type CardsContainerProps = HTMLAttributes<HTMLDivElement> & {
  view: 'grid' | 'list'
  children?: ReactNode
}

const GridContainer = styled('div')`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
`

const ListContainer = styled(Flex)`
  flex-direction: column;
  gap: var(--space-3);

  > * {
    width: 95%;
  }
`

export default function CardsContainer({
  view,
  children,
  ...props
}: CardsContainerProps) {
  return view === 'grid' ? (
    <GridContainer {...props}>{children}</GridContainer>
  ) : (
    <ListContainer {...props}>{children}</ListContainer>
  )
}
