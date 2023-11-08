import {
  Dismiss16Regular as CloseIcon,
  Maximize16Regular as MaxIcon,
  Subtract16Regular as MinIcon,
} from '@fluentui/react-icons'
import { Flex } from '@radix-ui/themes'
import styled from 'styled-components'
import type { WindowControlAction } from '@shared/api'

const Container = styled(Flex)`
  position: fixed;
  top: 0;
  right: 0;
  -webkit-app-region: no-drag;
  z-index: 2;
  color: var(--gray-7);

  .focused & {
    color: var(--gray-11);
  }
`

const Button = styled('button')`
  appearance: none;
  border: none;
  background: none;
  width: 50px;
  height: 34px;
  color: inherit;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
  transition-property: color, background;

  &:last-child {
    &:hover {
      background: var(--red-9);
    }
  }

  &:hover {
    color: var(--gray-12);
    background: var(--gray-4);
  }
`

export default function WindowControls() {
  const handle = (state: WindowControlAction) => async () => {
    await window.api['window.control'](state)
  }

  return (
    <Container>
      <Button onClick={handle('minimize')}>
        <MinIcon />
      </Button>
      <Button onClick={handle('maximize.toggle')}>
        <MaxIcon />
      </Button>
      <Button onClick={handle('close')}>
        <CloseIcon />
      </Button>
    </Container>
  )
}
