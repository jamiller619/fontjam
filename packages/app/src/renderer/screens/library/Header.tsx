import { Flex } from '@radix-ui/themes'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import Filters from './Filters'
import Search from './Search'

type HeaderProps = HTMLAttributes<HTMLDivElement>

const Controls = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
`

const StyledSearch = styled(Search)`
  -webkit-app-region: no-drag;
`

const Container = styled(Flex)`
  flex-direction: column;
  justify-content: space-between;
  z-index: 1;
  -webkit-app-region: drag;
  /* background: var(--gray-2); */
  background: var(--black-a4);
  padding-top: var(--space-4);
`

export default function Header(props: HeaderProps) {
  return (
    <Container {...props}>
      <Controls>
        <StyledSearch />
        <Filters />
        <div />
      </Controls>
    </Container>
  )
}
