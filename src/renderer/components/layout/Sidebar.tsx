import {
  ChevronLeft20Filled as CollapseIcon,
  Navigation20Filled as ExpandIcon,
} from '@fluentui/react-icons'
import { Flex, IconButton } from '@radix-ui/themes'
import styled from 'styled-components'
import { Logo, NavItem, NavSection } from '~/components/menu'
import useAppState from '~/hooks/useAppState'
import { useCollections, useLibraries } from '~/hooks/useCatalog'
import * as SidebarAnimation from './SidebarAnimation'

const Container = styled(Flex)<{ $isOpen: boolean }>`
  flex-direction: column;
  gap: var(--space-3);
  background-color: var(--gray-surface);
  padding: var(--space-3);
  color: var(--gray-11);
  font-weight: 500;
  overflow: hidden;
  border-right: var(--default-border);

  ${({ $isOpen }) => SidebarAnimation.Container($isOpen)}
`

const Nav = styled('nav')`
  height: 100%;
  display: flex;
  flex-direction: column;
`

const ToggleButton = styled(IconButton).attrs({
  color: 'gray',
  variant: 'ghost',
  size: '4',
})`
  display: inline-flex;
  align-self: end;
  margin: 6px 0;
  cursor: pointer;
  transition: background-color 200ms ease-in-out, color 200ms ease-in-out;

  &:hover {
    color: var(--gray-12);
    background-color: var(--gray-3);
  }
`

const StyledLogo = styled(Logo)`
  transform: translate(13px, 15px);
`

export default function Sidebar() {
  const libraries = useLibraries()
  const collections = useCollections()

  const [state, setAppState] = useAppState()

  const handleToggleClick = () => {
    setAppState((prev) => ({
      ...prev,
      'sidebar.open': !prev['sidebar.open'],
    }))
  }

  return (
    <Container $isOpen={state['sidebar.open']}>
      <StyledLogo />
      <ToggleButton onClick={handleToggleClick}>
        {state['sidebar.open'] ? <CollapseIcon /> : <ExpandIcon />}
      </ToggleButton>
      <Nav>
        <NavSection label="Library">
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
        <NavSection label="Collection">
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
      </Nav>
    </Container>
  )
}
