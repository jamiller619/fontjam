import { ChevronLeft20Filled as IndexIcon } from '@fluentui/react-icons'
import { Flex } from '@radix-ui/themes'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import AnimatedLink from '~/components/AnimatedLink'
import Backdrop from '~/components/Backdrop'
import { useFontFamily } from '~/hooks/useFonts'

const Container = styled(Flex)`
  flex-direction: column;
  background-color: var(--gray-3);
  width: 50vw;
  height: 100vh;
  view-transition-name: family;
  overflow-y: auto;
  overflow-x: hidden;
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  -webkit-app-region: no-drag;
`

const Link = styled(AnimatedLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--accent-9);
`

export default function Family() {
  const { name } = useParams()
  const { font, error } = useFontFamily(name)

  return (
    <Fragment>
      <Backdrop />
      <Container>
        <Link to="/">
          <IndexIcon /> index
        </Link>
        {error && <p>{error.message}</p>}
        <pre style={{ width: '50vw' }}>
          {JSON.stringify(font?.names, null, 2)}
        </pre>
      </Container>
    </Fragment>
  )
}
