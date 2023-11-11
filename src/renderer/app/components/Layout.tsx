import { Flex } from '@radix-ui/themes'
import { Fragment } from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import WindowControls from '~/components/WindowControls'
import useSetFocus from '../../hooks/useAppFocus'
import Footer from './Footer'
import Sidebar from './Sidebar'

const Container = styled(Flex)`
  // There has to be a better way of doing this, but 25px
  // represents the height of the footer.
  height: calc(100vh - 25px);
`

const OutletContainer = styled(Flex)`
  flex-grow: 1;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(135deg, var(--gray-a2) 20%, var(--gray-a1) 80%);
`

export default function Layout() {
  useSetFocus()

  return (
    <Fragment>
      <Container>
        <Sidebar />
        <OutletContainer>
          <Outlet />
        </OutletContainer>
      </Container>
      <Footer />
      <WindowControls />
    </Fragment>
  )
}
