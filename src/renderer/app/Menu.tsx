import {
  ChevronLeft20Filled as CollapseIcon,
  Navigation20Filled as ExpandIcon,
} from '@fluentui/react-icons'
import { Box, Flex } from '@radix-ui/themes'
import styled from 'styled-components'
import { Logo, NavItem, NavSection } from '~/components/menu'
import useAppState from '~/hooks/useAppState'
import { useCollections, useLibraries } from '~/hooks/useCatalog'

const libraryLabel = {
  singular: 'Library',
  plural: 'Libraries',
}

const collectionsLabel = {
  singular: 'Collection',
  plural: 'Collections',
}

const Container = styled(Flex)<{ $width: number }>`
  flex-direction: column;
  gap: var(--space-3);
  background-color: var(--gray-surface);
  padding: var(--space-3);
  color: var(--gray-11);
  /* position: relative; */
  width: 70px; // This prevents the nav from jumping around in layout when the app loads
  min-width: ${({ $width }) => $width}px;
  transition: min-width 200ms cubic-bezier(1, 0, 0.5, 1);
  font-weight: 500;
`

const ToggleButton = styled(Box)`
  display: inline-flex;
  padding: 10px;
  width: max-content;
  margin-left: 3px;
  margin-top: -5px;
  border-radius: 100%;
  -webkit-app-region: no-drag;
  z-index: 2;
  cursor: pointer;
  transition: background-color 200ms ease-in-out, color 200ms ease-in-out;
  color: var(--gray-11);

  &:hover {
    color: var(--gray-12);
    background-color: var(--gray-3);
  }
`

export default function Menu() {
  const libraries = useLibraries()
  const collections = useCollections()

  const [{ isSidebarOpen }, setAppState] = useAppState()
  const width = isSidebarOpen ? 200 : 70

  const handleToggleClick = () => {
    setAppState((prev) => ({
      ...prev,
      isSidebarOpen: !prev.isSidebarOpen,
    }))
  }

  return (
    <Container $width={width}>
      <Logo />
      <ToggleButton onClick={handleToggleClick}>
        {isSidebarOpen ? <CollapseIcon /> : <ExpandIcon />}
      </ToggleButton>
      <nav>
        <NavSection label={libraryLabel}>
          {libraries?.map((library) => (
            <NavItem
              key={library.id}
              href={`/library/${library.id}`}
              label={library.name}
              icon={library.icon}
              color={library.color}
            />
          ))}
        </NavSection>
        <NavSection label={collectionsLabel}>
          {collections?.map((collection) => (
            <NavItem
              key={collection.id}
              href={`/collection/${collection.id}`}
              label={collection.name}
              icon={collection.icon}
              color={collection.color}
            />
          ))}
        </NavSection>
      </nav>
    </Container>
  )
}
