import {
  CircleSmall20Filled as ActiveIcon,
  CircleSmall20Regular as InactiveIcon,
  Tv20Regular as SystemIcon,
} from '@fluentui/react-icons'
import { Box } from '@radix-ui/themes'
import styled from 'styled-components'
import Logo from './Logo'
import NavItem from './NavItem'
import NavSection from './NavSection'

const Container = styled(Box)`
  background-color: var(--gray-surface);
  padding: var(--space-2);
`

const LogoContainer = styled('div')`
  padding: var(--space-3) 0;
  -webkit-app-region: drag;
`

const libraryLabel = {
  singular: 'Library',
  plural: 'Libraries',
}

const collectionsLabel = {
  singular: 'Collection',
  plural: 'Collections',
}

export default function Menu() {
  return (
    <Container>
      <LogoContainer>
        <Logo />
      </LogoContainer>
      <nav>
        <NavSection label={libraryLabel}>
          <NavItem href="/" label="System" icon={<SystemIcon />} />
        </NavSection>
        <NavSection label={collectionsLabel}>
          <NavItem href="/" label="Active" icon={<ActiveIcon />} />
          <NavItem href="/" label="Inactive" icon={<InactiveIcon />} />
        </NavSection>
      </nav>
    </Container>
  )
}
