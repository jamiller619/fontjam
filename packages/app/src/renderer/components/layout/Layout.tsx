import { Flex } from '@radix-ui/themes'
import { Fragment } from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { Menu } from '~/components/menu'
import Footer from './Footer'
import WindowControls from './WindowControls'

const Container = styled(Flex)`
  // There has to be a better way of doing this, but 25px
  // is roughly the height of the footer.
  height: calc(100vh - 25px);
`

const OutletContainer = styled(Flex)`
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
`

const isWindows = window.navigator.platform.startsWith('Win')

export default function Layout() {
  return (
    <Fragment>
      <Container>
        <Menu />
        <OutletContainer>
          <Outlet />
        </OutletContainer>
      </Container>
      <Footer />
      {isWindows && <WindowControls />}
      <div id="portalContainer" />
    </Fragment>
  )
}
