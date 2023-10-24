import { Flex } from '@radix-ui/themes'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import AnimatedLink from '~/components/AnimatedLink'

type NavItemProps = HTMLAttributes<HTMLLIElement> & {
  label: string
  icon: React.ReactNode
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

  &:hover {
    background-color: var(--gray-a3);
  }
`

const IconContainer = styled(Flex)`
  width: 20px;
  align-items: center;
  justify-content: center;
`

export default function NavItem({ label, icon, href, ...props }: NavItemProps) {
  return (
    <Container {...props}>
      <Link to={href}>
        <IconContainer>{icon}</IconContainer> {label}
      </Link>
    </Container>
  )
}
