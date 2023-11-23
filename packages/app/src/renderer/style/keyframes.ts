import { keyframes } from 'styled-components'

export const fadein = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`

export const fadeout = keyframes`
from {
  opacity: 1;
}
to {
  opacity: 0;
}
`
