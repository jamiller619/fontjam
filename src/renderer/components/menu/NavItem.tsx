import { Flex } from '@radix-ui/themes'
import { HTMLAttributes, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import AnimatedLink from '~/components/AnimatedLink'
import useClassNames from '~/hooks/useClassNames'
import usePress from '~/hooks/usePress'
import CustomIcon from './CustomIcon'

type NavItemProps = HTMLAttributes<HTMLLIElement> & {
  label: string
  icon: string
  href: string
}

const Container = styled('li')`
  min-width: 180px;
`

const Link = styled(AnimatedLink)`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-4);
  color: currentColor;
  text-decoration: none;
  font-size: var(--font-size-2);
  transition: background-color 100ms ease-in-out;

  &.active {
    background-color: var(--gray-a3);
    color: var(--gray-12);
  }

  &.pressed {
    background-color: var(--gray-a2);
    color: var(--gray-12);
  }

  &:hover:not(.active):not(.pressed) {
    background-color: var(--gray-a3);
    color: var(--gray-12);
  }
`

const IconContainer = styled(Flex)`
  width: 20px;
  align-items: center;
  justify-content: center;
`

export default function NavItem({ label, icon, href, ...props }: NavItemProps) {
  const location = useLocation()
  const ref = useRef<HTMLAnchorElement>(null)
  const isPressed = usePress(ref)
  const classNames = useClassNames({
    active: location.pathname === href,
    pressed: isPressed,
  })

  return (
    <Container {...props}>
      <Link to={href} {...classNames} ref={ref}>
        <IconContainer>
          <CustomIcon name={icon} />
        </IconContainer>
        {label}
      </Link>
    </Container>
  )
}
