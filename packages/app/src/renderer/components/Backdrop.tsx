import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Container = styled('div')`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--gray-surface);
  backdrop-filter: blur(10px);
  z-index: 2;
`

export default function Backdrop(props: HTMLAttributes<HTMLDivElement>) {
  return <Container {...props} />
}
