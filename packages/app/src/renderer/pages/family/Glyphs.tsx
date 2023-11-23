import { Flex, Text } from '@radix-ui/themes'
import { HTMLAttributes, useEffect, useRef } from 'react'
import styled from 'styled-components'

type GlyphsProps = HTMLAttributes<HTMLDivElement> & {
  data?: opentype.Font | null
}

type GlyphProps = GlyphsProps & {
  index: number
}

const glyphD = {
  x: 12,
  y: 38,
  width: 50,
  height: 50,
  fontSize: 36,
}

const Canvas = styled('canvas').attrs({
  width: glyphD.width,
  height: glyphD.height,
})`
  border: 1px solid var(--gray-5);
`

const GlyphContainer = styled(Flex)`
  gap: 0;
  flex-direction: column;
  align-items: center;
`

type CanvasDrawingOptions = {
  width?: number
  height?: number
  path?: () => opentype.Path | undefined
}

function useDrawPath({ height, width, path }: CanvasDrawingOptions) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const ctx = ref.current.getContext('2d')!

    ctx.clearRect(0, 0, width ?? 0, height ?? 0)

    const p = path?.()

    if (p) p.draw(ctx)
  }, [height, path, width])

  return ref
}

function Glyph({ data, index }: GlyphProps) {
  const ref = useDrawPath({
    height: glyphD.height,
    width: glyphD.width,
    path: () => {
      const glyph = data?.glyphs.get(index)
      const path = glyph?.getPath(glyphD.x, glyphD.y, glyphD.fontSize)

      if (path?.fill) {
        path.fill = 'white'
      }

      return path
    },
  })

  return (
    <GlyphContainer>
      <Canvas ref={ref} />
      <Text size="1">{index}</Text>
    </GlyphContainer>
  )
}

const Container = styled(Flex)`
  flex-wrap: wrap;
  gap: var(--space-1);
`

export default function Glyphs({ data, ...props }: GlyphsProps) {
  const loop = new Array(Math.min(100, data?.glyphs.length ?? 0)).fill(
    undefined
  )

  return (
    <Container {...props}>
      {data != null
        ? loop
            .map((_, i) => <Glyph key={i} data={data} index={i} />)
            .filter(Boolean)
        : null}
    </Container>
  )
}
