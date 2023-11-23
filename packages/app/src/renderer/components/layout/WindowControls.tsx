import {
  Dismiss16Regular as CloseIcon,
  Maximize16Regular as MaxIcon,
  Subtract16Regular as MinIcon,
} from '@fluentui/react-icons'
import { Flex } from '@radix-ui/themes'
import styled, { css } from 'styled-components'
import type { WindowControlAction } from '@shared/api'
import useAppFocus from '~/hooks/useAppFocus'

const Container = styled(Flex)<{ $isWindowFocused: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  -webkit-app-region: no-drag;
  z-index: 3;
  color: var(--gray-7);

  ${({ $isWindowFocused }) =>
    $isWindowFocused &&
    css`
      color: var(--gray-11);
    `}
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

  const isFocused = useAppFocus()

  return (
    <Container $isWindowFocused={isFocused}>
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
