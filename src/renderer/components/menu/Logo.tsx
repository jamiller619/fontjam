import { SVGAttributes } from 'react'
import styled from 'styled-components'

type LogoProps = SVGAttributes<SVGSVGElement>

const Container = styled('svg')`
  width: 100%;
  height: 50px;
`

export default function Logo(props: LogoProps) {
  return (
    <Container viewBox="0 0 112.05 167.86" {...props}>
      <path
        fill="#0e3bda"
        d="M56.29,56.46a.62.62,0,0,1,1.08.23l21.54,53.86a.63.63,0,0,1-.63.92H1.09c-.55,0-.68-.31-.29-.7Z"
      />
      <path
        fill="#ce275e"
        d="M58.08,167.19c-1.17,1.17-2.12.77-2.12-.88V57.64c0-1.65.95-2,2.12-.87l53.09,53.09a3,3,0,0,1,0,4.24Z"
      />
      <path
        fill="#ce275e"
        d="M109.79,1c1.65,0,2,1,.87,2.14L2.13,110.66C1,111.82,0,111.42,0,109.77V3A3,3,0,0,1,3,0Z"
      />
    </Container>
  )
}
