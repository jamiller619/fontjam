import { Flex } from '@radix-ui/themes'
import { HTMLAttributes, memo } from 'react'
import styled from 'styled-components'
import { Font } from '@shared/types/dto'
import useOpenTypeFont, { useFontFace } from '~/hooks/useOpenTypeFont'

type GlyphsProps = HTMLAttributes<HTMLDivElement> & {
  data?: Font
  postscriptFamilyName?: string | null
}

type GlyphProps = {
  data?: opentype.Glyph
}

type ContainerProps = {
  $fontName?: string
}

function renderContainerStyle(props: ContainerProps) {
  return {
    style: {
      fontFamily: props.$fontName,
    },
  }
}

const Container = styled('div').attrs<ContainerProps>(renderContainerStyle)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  border-left: 1px solid var(--gray-5);
  border-bottom: 1px solid var(--gray-5);
  font-size: var(--font-size-8);
`

const GlyphContainer = styled(Flex)`
  gap: 0;
  flex-direction: column;
  align-items: center;
  border-top: 1px solid var(--gray-5);
  border-right: 1px solid var(--gray-5);
`

function formatUnicode(unicode?: number) {
  if (!unicode) return

  return `U+${unicode.toString(16).padStart(4, '0').toUpperCase()}`
}

function getGlyphTitle(data?: opentype.Glyph) {
  if (!data) return ''

  return `${data.name ? `${data.name}\n` : ''}${data.unicodes
    ?.map(formatUnicode)
    .join(', ')}`
}

function Glyph({ data }: GlyphProps) {
  const code = data?.unicode?.toString(16)
  const text = code ? `&#x${code};` : null

  return (
    <GlyphContainer
      title={getGlyphTitle(data)}
      dangerouslySetInnerHTML={{
        __html: text ?? '',
      }}
    />
  )
}

function Glyphs({ data, postscriptFamilyName, ...props }: GlyphsProps) {
  const fontData = useOpenTypeFont(data)
  const isLoaded = useFontFace(data, postscriptFamilyName)

  const loop = new Array(fontData?.numGlyphs).fill(false)

  return isLoaded ? (
    <Container {...props} $fontName={data?.fullName}>
      {data != null
        ? loop
            .map((_, i) => <Glyph key={i} data={fontData?.glyphs.get(i)} />)
            .filter(Boolean)
        : null}
    </Container>
  ) : null
}

export default memo(Glyphs)
