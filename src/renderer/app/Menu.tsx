import { Box } from '@radix-ui/themes'
import styled from 'styled-components'
import { Logo, NavItem, NavSection } from '~/components/menu'
import { useLibraries } from '~/hooks/useLibrary'

const Container = styled(Box)`
  background-color: var(--gray-surface);
  padding: var(--space-2);
  color: var(--gray-11);
`

const LogoContainer = styled('div')`
  padding: var(--space-3) 0;
  -webkit-app-region: drag;
`

const libraryLabel = {
  singular: 'Library',
  plural: 'Libraries',
}

export default function Menu() {
  const libraries = useLibraries()

  return (
    <Container>
      <LogoContainer>
        <Logo />
      </LogoContainer>
      <nav>
        <NavSection label={libraryLabel}>
          {libraries?.map((library) => (
            <NavItem
              key={library.id}
              href={`/library/${library.id}`}
              label={library.name}
              icon={library.icon}
            />
          ))}
        </NavSection>
      </nav>
    </Container>
  )
}
