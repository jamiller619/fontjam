import { Flex } from '@radix-ui/themes'
import { Fragment, useEffect, useState } from 'react'
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
  background: linear-gradient(135deg, var(--gray-3) 20%, var(--gray-a2) 80%);
`

const Loader = styled(Flex)`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--gray-a3);
`

export default function Layout() {
  const [startTime, setStartTime] = useState<null | number>(null)

  useEffect(() => {
    window.api.on('startup.complete', (ms) => {
      console.log('startup.complete', ms)

      setStartTime(ms)
    })
  }, [])

  console.log(startTime)

  return (
    <Fragment>
      <Container>
        <Menu />
        <OutletContainer>
          <Outlet />
        </OutletContainer>
      </Container>
      <Footer />
      <WindowControls />
      {/* {startTime == null && <Loader />} */}
    </Fragment>
  )
}
