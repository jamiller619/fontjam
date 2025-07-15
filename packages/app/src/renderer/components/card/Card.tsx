import {
  CaretLeft16Filled as CaretLeftIcon,
  CaretRight16Filled as CaretRightIcon,
} from '@fluentui/react-icons'
import { Flex, Heading, IconButton as RUIconButton } from '@radix-ui/themes'
import { HTMLAttributes, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { styled } from 'styled-components'
import { useDarkMode } from 'usehooks-ts'
import { Font, FontFamily } from '@shared/types/dto'
import AnimatedLink from '~/components/AnimatedLink'
import ContextMenu, { ContextMenuItem } from '~/components/ContextMenu'
import { FontPreview } from '~/components/font-preview'
import { View, useStore } from '~/store'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  data: FontFamily | undefined
  view?: View
}

const Header = styled(Heading).attrs({
  size: '5',
})`
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding-right: var(--space-5);
  width: 78%;
  letter-spacing: 0.02em;
  color: var(--accent-8);
  text-decoration: none;
  line-height: 1.1;
  font-weight: 500;
`

type ContainerProps = {
  $view: View
}

const Container = styled(Flex)<ContainerProps>`
  padding: var(--space-3);
  background-color: var(--gray-a2);
  flex-direction: column;
  color: var(--gray-11);
  transition-timing-function: ease-out;
  transition-property: background-color, color, box-shadow, transform, height;
  transition-duration: 100ms;

  canvas {
    opacity: 0.3;
  }

  border-radius: ${({ $view }) =>
    $view === 'grid' ? 'var(--radius-6)' : 'var(--radius-3)'};

  &:hover {
    background-color: var(--gray-a3);
    transform: ${({ $view }) =>
      $view === 'grid' ? 'scale(1.03)' : 'scale(1.002)'};
    box-shadow: 0 3px 30px 5px var(--black-a3);

    ${Header} {
      color: var(--accent-9);
    }

    canvas {
      opacity: 1;
    }
  }
`

const Footer = styled(Flex)`
  gap: var(--space-1);
  font-size: var(--font-size-1);
  flex-direction: column;
  align-items: center;
  height: 20%;

  .num-styles {
    color: var(--gray-10);
  }
`

const contextMenuItems: ContextMenuItem[] = [
  {
    text: 'Add to Favorites',
  },
  'separator',
  {
    text: 'Delete',
    color: 'red',
  },
]

const FooterStyleSelect = styled(Flex)`
  align-items: center;
  width: -webkit-fill-available;
  justify-content: space-around;
  gap: var(--space-1);

  span {
    flex: 1;
    text-align: center;
  }
`

function parseStyles(fonts?: Font[]) {
  const styles = fonts?.map((font) =>
    font.fvar == null ? font.style : 'Variable',
  )

  return [...new Set(styles)]
}

const Preview = styled(FontPreview)`
  height: 80%;
`

const IconButton = styled(RUIconButton).attrs({
  size: '3',
  variant: 'ghost',
  color: 'gray',
})``

export default function Card({ data, ...props }: CardProps) {
  const styles = parseStyles(data?.fonts)
  const containerRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const view = useStore((state) => state['library.filters.view'])
  const { isDarkMode } = useDarkMode()
  const previewColor = isDarkMode ? 'white' : 'black'
  const previewSize = useStore((state) => state['preview.size'])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const previewFont = data?.fonts.at(selectedIndex)
  const rect = containerRef.current?.getBoundingClientRect()

  const handleNextStyle = () => {
    if (styles.length <= 1) return

    const nextIndex = (selectedIndex + 1) % styles.length
    setSelectedIndex(nextIndex)
  }

  const handlePrevStyle = () => {
    if (styles.length <= 1) return

    const nextIndex = (selectedIndex - 1 + styles.length) % styles.length
    setSelectedIndex(nextIndex)
  }

  return data == null ? null : (
    <ContextMenu content={contextMenuItems}>
      <Container {...props} ref={containerRef} $view={view}>
        <Header asChild>
          <AnimatedLink to={`/family/${data.id}?from=${location.pathname}`}>
            {data.name}
          </AnimatedLink>
        </Header>
        <Preview
          key={previewFont?.id}
          fontId={previewFont?.id}
          fontName={previewFont?.fullName}
          color={previewColor}
          fontSize={previewSize}
          width={(rect?.width ?? 0) - 24}
          height={(rect?.height ?? 0) - 24}>
          Ag
        </Preview>
        <Footer>
          <FooterStyleSelect>
            {styles.length > 1 && (
              <IconButton onClick={handlePrevStyle}>
                <CaretLeftIcon />
              </IconButton>
            )}
            <span>{styles[selectedIndex]}</span>
            {styles.length > 1 && (
              <IconButton onClick={handleNextStyle}>
                <CaretRightIcon />
              </IconButton>
            )}
          </FooterStyleSelect>
          {styles.length > 1 && (
            <span className="num-styles">{styles.length} styles</span>
          )}
        </Footer>
      </Container>
    </ContextMenu>
  )
}
