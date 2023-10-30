import { Flex } from '@radix-ui/themes'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import AnimatedLink from '~/components/AnimatedLink'

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

  &:hover {
    background-color: var(--gray-a3);
  }
`

const IconContainer = styled(Flex)`
  width: 20px;
  align-items: center;
  justify-content: center;
`

const icons = await import('@fluentui/react-icons')

const renderIcon = (name: string) => {
  const Icon = icons[name as keyof typeof icons]

  // @ts-ignore: This works fine, but TS doesn't like it.
  // Presumably because @fluentui contains exports that
  // aren't icons, but we limit the name to only icons.
  return <Icon />
}

export default function NavItem({ label, icon, href, ...props }: NavItemProps) {
  return (
    <Container {...props}>
      <Link to={href}>
        <IconContainer>{renderIcon(icon)}</IconContainer> {label}
      </Link>
    </Container>
  )
}
