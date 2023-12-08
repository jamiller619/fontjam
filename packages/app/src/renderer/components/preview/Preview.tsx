import { Box } from '@radix-ui/themes'
import { ForwardedRef, HTMLAttributes, forwardRef } from 'react'
import { styled } from 'styled-components'
import { Font } from '@shared/types'
import { useFontFace } from '~/hooks/useFontData'

type PreviewProps = HTMLAttributes<HTMLDivElement> & {
  font?: Font
  size?: number
  children?: string
}

type ContainerProps = {
  $name?: string
  $size?: number
}

function renderContainerAttributes(props: ContainerProps) {
  return {
    style: {
      fontFamily: props.$name,
      fontSize: props.$size,
    },
  }
}

const Container = styled(Box).attrs<ContainerProps>(renderContainerAttributes)`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`

export default forwardRef(function Preview(
  props: PreviewProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const { font, size, ...restProps } = props
  const isLoaded = useFontFace(font)

  return isLoaded ? (
    <Container {...restProps} $name={font?.fullName} $size={size} ref={ref}>
      {props.children}
    </Container>
  ) : null
})
