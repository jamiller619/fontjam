import { useDraggable } from '@dnd-kit/core'
import { Badge, Flex, Heading } from '@radix-ui/themes'
import {
  Fragment,
  HTMLAttributes,
  MouseEvent,
  useCallback,
  useRef,
} from 'react'
import { useLocation } from 'react-router-dom'
import { css, styled } from 'styled-components'
import { useHover } from 'usehooks-ts'
import { Font, FontFamily } from '@shared/types'
import AnimatedLink from '~/components/AnimatedLink'
import ContextMenu, { ContextMenuItem } from '~/components/ContextMenu'
import { Preview } from '~/components/preview'
import useAppState from '~/hooks/useAppState'

type View = 'grid' | 'list'

type CardProps = HTMLAttributes<HTMLDivElement> & {
  data: FontFamily
  view: View
}

const Header = styled(Heading).attrs({
  size: '5',
})`
  margin-bottom: var(--space-1);
  letter-spacing: 0.02em;
  color: var(--accent-8);
  text-decoration: none;
  line-height: 1.1;
  font-weight: 650;

  a {
    position: relative;
    z-index: 1000;
  }
`

type ContainerProps = {
  $view: View
  $isHovered: boolean
}

const Container = styled(Flex)<ContainerProps>`
  padding: var(--space-4) var(--space-3) var(--space-3);
  background-color: var(--gray-a2);
  flex-direction: column;
  color: var(--gray-9);
  transition-timing-function: ease-in;
  transition-property: background-color, color, box-shadow, transform, height;
  transition-duration: 100ms;
  /* box-shadow: none; */
  cursor: grab;
  touch-action: none;

  border-radius: ${({ $view }) =>
    $view === 'grid' ? 'var(--radius-6)' : 'var(--radius-3)'};
  /* &:active {
    cursor: grabbing;

    transition-duration: 0ms;
  } */
  ${({ $isHovered, $view }) =>
    $isHovered
      ? css`
          background-color: var(--gray-a3);
          color: var(--gray-12);
          transform: ${$view === 'grid' ? 'scale(1.03)' : 'scale(1.002)'};
          box-shadow: 0 3px 30px 5px var(--black-a3);

          ${Header} {
            color: var(--accent-9);
          }
        `
      : ''}/* &:hover {
    background-color: var(--gray-a3);
    color: var(--gray-12);
    transform: ${({ $view }) =>
    $view === 'grid' ? 'scale(1.03)' : 'scale(1.002)'};
    box-shadow: 0 3px 30px 5px var(--black-a3);

    ${Header} {
      color: var(--accent-9);
    }
  } */
`

const FooterBadge = styled(Badge).attrs({
  variant: 'soft',
  color: 'gray',
  mr: '1',
  mt: '1',
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

// const applyViewTransition = (name: string, ref?: RefObject<HTMLElement>) => {
//   if (ref && ref.current) {
//     ref.current.style.viewTransitionName = name
//   }

//   return function applyViewTransitionCleanup() {
//     if (ref && ref.current) {
//       ref.current.style.viewTransitionName = ''
//     }
//   }
// }
const Content = styled(Flex).attrs({
  direction: 'column',
  gap: '1',
  justify: 'between',
})`
  height: 100%;
`

function parseStyles(fonts?: Font[]) {
  return [...new Set(fonts?.map((font) => font.style))]
}

export default function Card({ data, view, ...props }: CardProps) {
  const [state] = useAppState()
  const styles = parseStyles(data?.fonts)
  const containerRef = useRef<HTMLDivElement>()
  const isHovered = useHover(containerRef)
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${data?.id}-draggable`,
    data,
  })
  const location = useLocation()
  // const id = useId()
  // const { attributes, listeners, setNodeRef, transform } = useDraggable({
  //   id: `${id}-draggable`,
  // })
  // const headingRef = useRef<HTMLHeadingElement>(null)
  // const previewRef = useRef<HTMLDivElement>(null)

  // useImperativeHandle(ref, () => containerRef.current as HTMLDivElement, [
  //   containerRef,
  // ])

  // In this specific case, by intercepting the event in the
  // `AnimatedLink` component, we can return a function to
  // the Click event that will run after the transition
  // begins, but before the DOM updates, which is what
  // allows the whole thing to work.
  const handleLinkClick = useCallback((e: MouseEvent) => {
    e.preventDefault()

    // const clean = [
    // applyViewTransition('card', containerRef),
    // applyViewTransition('heading', headingRef),
    // applyViewTransition('preview', previewRef),
    // ]

    return function linkClickCleanup() {
      // clean.map((c) => c())
    }
  }, [])

  return (
    <ContextMenu content={contextMenuItems}>
      <Container
        {...props}
        ref={(el) => {
          containerRef.current = el!

          setNodeRef(el)
        }}
        $view={view}
        $isHovered={isHovered}>
        {data != null && (
          <Fragment>
            <Header asChild>
              <AnimatedLink
                to={`/family/${data.id}?from=${location.pathname}`}
                onClick={handleLinkClick}>
                {data.name}
              </AnimatedLink>
            </Header>
            <Content {...attributes} {...listeners}>
              <Preview className="preview" font={data.fonts.at(0)} size={64}>
                Ag
              </Preview>
              <Footer className="footer">
                {styles?.slice(0, 4).map((style, i) => (
                  <FooterBadge key={`${i}:${data.name}:${style}`}>
                    {style}
                  </FooterBadge>
                ))}
                {(styles?.length ?? 0) > 4 && (
                  <FooterBadge>+{(styles?.length ?? 0) - 4}</FooterBadge>
                )}
              </Footer>
            </Content>
          </Fragment>
        )}
      </Container>
    </ContextMenu>
  )
}
