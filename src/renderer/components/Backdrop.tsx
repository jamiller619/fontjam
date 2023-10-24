import styled from 'styled-components'

const Container = styled('div')`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--gray-surface);
  backdrop-filter: blur(10px);
`

export default function Backdrop() {
  return <Container />
}
