import { Text } from '@radix-ui/themes'
import { HTMLAttributes, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import AnimatedLink from '~/components/AnimatedLink'
import { Droppable } from '~/components/dnd'
import useClassNames from '~/hooks/useClassNames'
import usePress from '~/hooks/usePress'
import { control } from '~/style/styles'
import MenuIcon from './MenuIcon'

type NavItemProps = HTMLAttributes<HTMLLIElement> & {
  label: string
  icon: string
  href: string
}

const Label = styled(Text)`
  position: absolute;
  left: 40px;
  top: 11px;
  width: 150px;
`

const Link = styled(AnimatedLink)`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-4);
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;

  height: 40px;
  padding: 0 13px;
  position: relative;

  filter: grayscale(1);

  span:last-child {
    color: var(--gray-11);
  }

  ${control.style}

  &.active {
    filter: none;

    ${control.active}

    span:last-child {
      color: var(--gray-12);
    }
  }

  &.pressed:not(.active) {
    filter: none;
    ${control.pressed}
  }

  &:hover:not(.active):not(.pressed) {
    filter: none;
    ${control.hover}
  }

  &.dropover {
    filter: none;
    ${control.active}
    outline: 2px solid var(--accent-9);
  }
`

export default function MenuItem(props: NavItemProps) {
  const location = useLocation()
  const isPressedLinkRef = useRef<HTMLAnchorElement>(null)
  const isPressed = usePress(isPressedLinkRef)
  const [isOver, setIsOver] = useState(false)

  const { label, icon, href, ...rest } = props
  const isActive = location.pathname === href

  const classNames = useClassNames({
    active: isActive,
    pressed: isPressed,
    dropover: isOver,
  })

  const handlers = useMemo(
    () => ({
      onDropOver() {
        setIsOver(true)
      },
      onDropOut() {
        setIsOver(false)
      },
    }),
    [],
  )

  return (
    <Droppable as="li" id={label} {...rest} {...handlers}>
      <Link to={href} {...classNames} ref={isPressedLinkRef}>
        <MenuIcon name={icon} />
        <Label className="navItemLinkLabel">{label}</Label>
      </Link>
    </Droppable>
  )
}
