import { Box } from '@radix-ui/themes'
import {
  ForwardedRef,
  HTMLAttributes,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import { styled } from 'styled-components'
import { useFontFace } from '~/hooks/useFontData'

type PreviewProps = Omit<HTMLAttributes<HTMLDivElement>, 'id'> & {
  id?: number
  name?: string
  size?: number
  children?: string
}

const Container = styled(Box)<{ $name?: string; $size?: number }>`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: '${({ $name }) => $name}';
  font-size: ${({ $size }) => $size}px;
`

export default forwardRef(function Preview(
  props: PreviewProps,
  outerRef: ForwardedRef<HTMLDivElement>
) {
  const { id, name, size, ...restProps } = props
  const isLoaded = useFontFace(id, name)
  const innerRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(outerRef, () => innerRef.current as HTMLDivElement, [
    innerRef,
  ])

  return isLoaded && name ? (
    <Container {...restProps} $name={name} $size={size} ref={innerRef}>
      {props.children}
    </Container>
  ) : null
})
