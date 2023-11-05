import { Box, Flex, Heading, Separator } from '@radix-ui/themes'
import { Fragment, ReactNode, useRef } from 'react'
import { styled } from 'styled-components'
import useAppState from '~/hooks/useAppState'
import { fadein } from '~/style/keyframes'

type NavSectionProps = {
  children?: ReactNode
  label: {
    singular: string
    plural: string
  }
}

const Container = styled(Flex)`
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: 18px;
`

const Label = styled(Heading).attrs({
  size: '1',
})`
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--gray-8);
`

const Navlist = styled('ol')`
  list-style: none;
  margin: 0 0 var(--space-2) 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`

const Header = styled(Flex)`
  align-items: center;
  margin: 0 10px;
  height: 16px;

  .rt-Separator {
    margin: 0 auto;
    height: 2px;
    width: 100%;
    animation: 200ms ease-out 100ms both ${fadein};
  }
`

export default function NavSection({ children, label }: NavSectionProps) {
  const ref = useRef(null)
  const [{ isSidebarOpen }] = useAppState()

  return (
    <Container>
      <Header>
        {isSidebarOpen ? <Label>{label.plural}</Label> : <Separator />}
      </Header>
      <Navlist ref={ref}>{children}</Navlist>
    </Container>
  )
}
