import { Tooltip } from '@radix-ui/themes'
import { HTMLAttributes, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Catalog } from '@shared/types'
import AnimatedLink from '~/components/AnimatedLink'
import useAppState from '~/hooks/useAppState'
import useClassNames from '~/hooks/useClassNames'
import usePress from '~/hooks/usePress'
import CustomIcon from './CustomIcon'

type NavItemProps = HTMLAttributes<HTMLLIElement> & {
  label: string
  icon: string
  href: string
  color: Catalog['color']
}

const Container = styled('li')`
  height: 46px;
`

const Icon = styled(CustomIcon)``

const Link = styled(AnimatedLink)`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-4);
  color: var(--gray-10);
  text-decoration: none;
  font-size: var(--font-size-2);
  transition: background-color 100ms ease-in-out;
  padding: 12px 0 12px 13px;

  &.active {
    background-color: var(--gray-a2);
    color: var(--gray-12);
  }

  &.pressed {
    background-color: var(--gray-a2);
    color: var(--gray-12);
  }

  &:hover:not(.active):not(.pressed) {
    background-color: var(--gray-a4);
    color: var(--gray-11);
  }
`

export default function NavItem({
  label,
  icon,
  href,
  color,
  ...props
}: NavItemProps) {
  const [{ isSidebarOpen }] = useAppState()
  const location = useLocation()
  const ref = useRef<HTMLAnchorElement>(null)
  const isPressed = usePress(ref)
  const classNames = useClassNames({
    active: location.pathname === href,
    pressed: isPressed,
  })

  return (
    <Container {...props}>
      <Tooltip content={!isSidebarOpen && `${label}`} side="right">
        <Link to={href} {...classNames} ref={ref}>
          <Icon name={icon} />
          {isSidebarOpen && label}
        </Link>
      </Tooltip>
    </Container>
  )
}
