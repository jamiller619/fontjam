import {
  Circle12Filled as CircleFilledIcon,
  Circle12Regular as CircleIcon,
} from '@fluentui/react-icons'
import { Badge, Flex, Heading } from '@radix-ui/themes'
import {
  Fragment,
  HTMLAttributes,
  MouseEvent,
  RefObject,
  useCallback,
  useRef,
} from 'react'
import { css, styled } from 'styled-components'
import { Family } from '@shared/types'
import AnimatedLink from '~/components/AnimatedLink'
import ContextMenu, { ContextMenuItem } from '~/components/ContextMenu'
import Preview from '~/components/Preview'
import useAppState from '~/hooks/useAppState'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  data: Family
  isVisible: boolean
  height: number
}

const Header = styled(Heading).attrs({
  size: '5',
})`
  margin-bottom: var(--space-1);
  letter-spacing: 0.02em;
  color: var(--accent-8);
  text-decoration: none;
`

const Container = styled(Flex)<{ $height: number }>`
  min-height: ${({ $height }) => $height}px;
  padding: var(--space-4) var(--space-3);
  border-radius: var(--radius-6);
  background-color: var(--gray-a2);
  flex-direction: column;
  color: var(--gray-9);
  transition-duration: 120ms;
  transition-timing-function: ease-in-out;
  transition-property: background-color, color, transform, box-shadow;

  &:hover {
    background-color: var(--gray-a3);
    color: var(--gray-12);
    transform: scale(1.04);
    box-shadow: 0 3px 30px 5px var(--black-a3);

    ${Header} {
      color: var(--accent-9);
    }
  }
`

const FooterBadge = styled(Badge).attrs({
  variant: 'soft',
  color: 'gray',
  mr: '1',
  mb: '1',
})``

const Footer = styled(Flex)`
  gap: 0;
  font-size: var(--font-size-1);
  flex-wrap: wrap;
  align-items: baseline;
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

function isInstalled(family: Family) {
  return family.fonts.every((f) => f.isInstalled)
}

type InstalledIconProps = {
  family: Family
}

const IconContainer = styled('div')<{ $isInstalled: boolean }>`
  ${({ $isInstalled }) =>
    $isInstalled &&
    css`
      color: var(--green-9);
    `}
`

function InstalledIcon({ family }: InstalledIconProps) {
  const installed = isInstalled(family)

  return (
    <IconContainer $isInstalled={installed}>
      {installed ? <CircleFilledIcon /> : <CircleIcon />}
    </IconContainer>
  )
}

const applyViewTransition = (name: string, ref?: RefObject<HTMLElement>) => {
  if (ref && ref.current) {
    ref.current.style.viewTransitionName = name
  }

  return function applyViewTransitionCleanup() {
    if (ref && ref.current) {
      ref.current.style.viewTransitionName = ''
    }
  }
}

export default function Card({
  data,
  height,
  isVisible = false,
  ...props
}: CardProps) {
  const [{ previewText, previewFontSize }] = useAppState()
  const styles = data.fonts.map((f) => f.style)
  const containerRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // In this specific case, by intercepting the event in the
  // `AnimatedLink` component, we can return a function to
  // the Click event that will run after the transition
  // begins, but before the DOM updates, which is what
  // allows the whole thing to work.
  const handleLinkClick = useCallback((e: MouseEvent) => {
    e.preventDefault()

    const clean = [
      applyViewTransition('card', containerRef),
      applyViewTransition('heading', headingRef),
      applyViewTransition('preview', previewRef),
    ]

    return function linkClickCleanup() {
      clean.map((c) => c())
    }
  }, [])

  return (
    <ContextMenu content={contextMenuItems}>
      <Container {...props} ref={containerRef} $height={height}>
        {isVisible && (
          <Fragment>
            <Flex justify="between" gap="1">
              <Header asChild ref={headingRef}>
                <AnimatedLink
                  to={`family/${data.name}`}
                  onClick={handleLinkClick}>
                  {data.name}
                </AnimatedLink>
              </Header>
              <InstalledIcon family={data} />
            </Flex>
            <Preview
              id={data.fonts.at(0)?.id}
              name={data.fonts.at(0)?.fullName}
              size={previewFontSize}
              ref={previewRef}>
              {previewText}
            </Preview>
            <Footer>
              {styles.slice(0, 4).map((style) => (
                <FooterBadge key={`${data}:${style}`}>{style}</FooterBadge>
              ))}
              {styles.length > 4 && (
                <FooterBadge>+{styles.length - 4}</FooterBadge>
              )}
            </Footer>
          </Fragment>
        )}
      </Container>
    </ContextMenu>
  )
}