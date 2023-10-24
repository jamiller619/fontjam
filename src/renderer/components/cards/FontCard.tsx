import { Badge, Box, Flex, Heading, Text } from '@radix-ui/themes'
import { HTMLAttributes, useMemo } from 'react'
import { styled } from 'styled-components'
import AnimatedLink from '~/components/AnimatedLink'
import useAppState from '~/hooks/useAppState'
import { LocalFontData } from '~/hooks/useFonts'

type FontCardProps = HTMLAttributes<HTMLDivElement> & {
  fontName: string
  fonts: LocalFontData[]
}

const Container = styled(Flex)`
  width: 220px;
  padding: var(--space-3) var(--space-3) var(--space-2) var(--space-2);
  border-radius: var(--radius-2);
  border: 3px solid var(--gray-4);
  flex-direction: column;
  color: var(--gray-9);

  &:hover {
    background-color: var(--gray-2-translucent);
    color: var(--gray-12);
    border-color: var(--accent-8);

    a {
      color: var(--accent-9);
    }
  }

  a {
    letter-spacing: 0.02em;
    color: var(--accent-8);
    text-decoration: none;
  }
`

const FooterBadge = styled(Badge).attrs({
  variant: 'soft',
  color: 'gray',
  mr: '1',
  mb: '1',
})``

const Footer = styled(Box)`
  margin-top: auto;
  font-size: var(--font-size-1);
  // "Styles" header height + Badge height * no of rows
  max-height: calc(22px + (24px * 2));
  overflow: hidden;
`

const Preview = styled(Box)<{ $font: string; $size: number }>`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ${({ $font }) => $font};
  font-size: ${({ $size }) => $size}px;
`

export default function FontCard({ fontName, fonts, ...props }: FontCardProps) {
  const [{ previewText, previewFontSize }] = useAppState()
  const styles = useMemo(
    () => ({
      items: fonts.slice(0, 4),
      total: fonts.length,
    }),
    [fonts]
  )

  return (
    <Container {...props}>
      {/* <Container style={{ height: previewFontSize * 10 + 10 }}> */}
      <Heading asChild size="5">
        <AnimatedLink to={`/family/${fontName}`}>{fontName}</AnimatedLink>
      </Heading>
      <Preview $font={fontName} $size={previewFontSize}>
        {previewText}
      </Preview>
      <Footer>
        <Box m="1">
          <Text size="1" weight="bold">
            Styles ({styles.total})
          </Text>
        </Box>
        {styles.items.map((font) => (
          <FooterBadge key={font.fullName}>{font.style}</FooterBadge>
        ))}
        {styles.total > styles.items.length && <FooterBadge>...</FooterBadge>}
      </Footer>
    </Container>
  )
}
