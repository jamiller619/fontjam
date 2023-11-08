import { Text } from '@radix-ui/themes'
import { HTMLAttributes, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'
import AnimatedLink from '~/components/AnimatedLink'
import useClassNames from '~/hooks/useClassNames'
import usePress from '~/hooks/usePress'
import { control } from '~/style/theme'
import CustomIcon from './CustomIcon'

type NavItemProps = HTMLAttributes<HTMLLIElement> & {
  label: string
  icon: string
  href: string
}

const Label = styled(Text)`
  position: absolute;
  left: 39px;
  top: 12px;
  width: 150px;
`

const Link = styled(AnimatedLink)`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  border-radius: var(--radius-4);
  text-decoration: none;
  font-size: var(--font-size-2);

  height: 46px;
  padding: 0 13px;
  position: relative;

  ${control.style}

  &.active {
    ${control.active}
  }

  &.pressed:not(.active) {
    ${control.pressed}
  }

  &:hover:not(.active):not(.pressed) {
    ${control.hover}
  }
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
    <li {...props}>
      <Link to={href} {...classNames} ref={ref}>
        <CustomIcon name={icon} />
        <Label className="navItemLinkLabel">{label}</Label>
      </Link>
    </li>
  )
}
