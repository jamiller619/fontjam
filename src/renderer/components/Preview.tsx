import { Box } from '@radix-ui/themes'
import { ForwardedRef, forwardRef, useImperativeHandle, useRef } from 'react'
import { css, styled } from 'styled-components'
import { useFontFace } from '~/hooks/useFontData'

type PreviewProps = {
  id?: number
  name?: string
  size?: number
  children?: string
}

const Container = styled(Box)<{ $fontSrc?: string; $size?: number }>`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  ${({ $fontSrc }) =>
    $fontSrc &&
    css`
      font-family: '${$fontSrc}';
    `}
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
    <Container {...restProps} $fontSrc={name} $size={size} ref={innerRef}>
      {props.children}
    </Container>
  ) : null
})
