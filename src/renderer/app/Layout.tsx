import { Flex } from '@radix-ui/themes'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import Footer from './Footer'
import Menu from './Menu'

const Container = styled(Flex)`
  height: 100vh;
`

const OutletContainer = styled(Flex)`
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
`

export default function Layout() {
  return (
    <Container>
      <Menu />
      <OutletContainer>
        <Outlet />
      </OutletContainer>
      {/* <Footer /> */}
    </Container>
  )
}
