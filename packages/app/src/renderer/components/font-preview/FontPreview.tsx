import { Box } from '@radix-ui/themes'
import {
  ForwardedRef,
  HTMLAttributes,
  forwardRef,
  useEffect,
  useRef,
} from 'react'
import useOpenTypeFont from '~/hooks/useOpenTypeFont'

type PreviewProps = HTMLAttributes<HTMLDivElement> & {
  fontId?: number
  fontName?: string
  children?: string
  color?: string
  fontSize?: number
  width?: number
  height?: number
}

export default forwardRef(Preview)

function Preview(props: PreviewProps, ref: ForwardedRef<HTMLDivElement>) {
  const { fontId, fontName, color, height, width, fontSize, ...restProps } =
    props
  const fontData = useOpenTypeFont(fontId, fontName)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heightWithPadding = (height ?? 0) - 64

  useEffect(() => {
    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext('2d')!
    ctx?.clearRect(0, 0, canvas.width, canvas.height)

    const path = fontData?.getPath(props.children!, 50, 120, fontSize ?? 72)

    if (path?.fill && color) {
      path.fill = color
    }

    path?.draw(ctx)
  }, [color, fontData, fontSize, props.children])

  return (
    <Box {...restProps} ref={ref}>
      <canvas height={heightWithPadding} width={width} ref={canvasRef} />
    </Box>
  )
}
