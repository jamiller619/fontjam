import { Flex } from '@radix-ui/themes'
import { Fragment } from 'react'
import { useParams } from 'react-router-dom'
import { styled } from 'styled-components'
import Backdrop from '~/components/Backdrop'
import { Textbox } from '~/components/input'
import { toTitleCase } from '~/utils/string'

const Container = styled(Flex)`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  align-items: center;
  justify-content: center;
`

const Window = styled(Flex)`
  width: 500px;
  height: 200px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: var(--gray-3);
  border-radius: var(--radius-4);
`

export default function AddItem() {
  const { type } = useParams()
  const name = toTitleCase(type)

  return (
    <Fragment>
      <Backdrop />
      <Container>
        <Window>
          <h1>Add {name}</h1>
          <Textbox />
        </Window>
      </Container>
    </Fragment>
  )
}
