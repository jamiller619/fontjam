import { Flex } from '@radix-ui/themes'
import { Fragment, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import styled from 'styled-components'
import { useEventListener } from 'usehooks-ts'
import WindowControls from '~/components/WindowControls'
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
`

export default function Layout() {
  const [isFocused, setIsFocused] = useState(true)

  useEventListener('focus', () => setIsFocused(true))
  useEventListener('blur', () => setIsFocused(false))

  useEffect(() => {
    if (isFocused) {
      document.body.classList.add('focused')
    } else {
      document.body.classList.remove('focused')
    }
  }, [isFocused])

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
