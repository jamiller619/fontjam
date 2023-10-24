import { Flex } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { Menu } from '~/components/menu'

const Container = styled(Flex)`
  gap: var(--space-2);
  height: 100vh;
  overflow: hidden;
`

const OutletContainer = styled(Flex)`
  flex-grow: 1;
  flex-direction: column;
`

export default function Layout() {
  return (
    <Container>
      <Menu />
      <OutletContainer>
        <Outlet />
      </OutletContainer>
    </Container>
  )
}
