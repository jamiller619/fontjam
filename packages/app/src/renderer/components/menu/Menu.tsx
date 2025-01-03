import {
  ChevronLeft20Filled as CollapseIcon,
  Navigation20Filled as ExpandIcon,
} from '@fluentui/react-icons'
import { Flex, IconButton } from '@radix-ui/themes'
import styled, { css } from 'styled-components'
import { Library, LibraryType } from '@shared/types/dto'
import { capitalize } from '@shared/utils/string'
import Logo from '~/components/Logo'
import { useLibraries } from '~/hooks/useLibrary'
import { useStore } from '~/store'
import MenuItem from './MenuItem'
import MenuSection from './MenuSection'

const Container = styled(Flex)<{ $isOpen: boolean }>`
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  color: var(--gray-11);
  font-weight: 500;
  overflow: hidden;
  border-right: var(--default-border);

  ${({ $isOpen }) => css`
    --nav-ease: cubic-bezier(1, 0, 0.5, 1);

    transition: flex 200ms var(--nav-ease);
    flex: 0 0 ${$isOpen ? '200px' : '70px'};

    .navItemLinkLabel {
      opacity: ${$isOpen ? '1' : '0'};
      transition: opacity 200ms var(--nav-ease);
    }

    .navSectionHeader {
      transition-duration: 200ms;
      transition-timing-function: var(--nav-ease);
      transition-property: background, transform;
      height: 16px;

      ${$isOpen
        ? css`
            background: transparent;
            transform: scaleY(1);
          `
        : css`
            background: var(--gray-8);
            transform: scaleY(0.1);
            width: 60%;
            overflow: hidden;
          `}
    }
  `}
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
  transition:
    background-color 200ms ease-in-out,
    color 200ms ease-in-out;

  &:hover {
    color: var(--gray-12);
    background-color: var(--gray-3);
  }
`

const StyledLogo = styled(Logo)`
  transform: translate(13px, 15px);
`

function createLibraryTypeFilter(library: Library[]) {
  return function filterLibraryType(type: LibraryType): Library[] | undefined {
    return library.filter((c) => c.type === type)
  }
}

type LibrarySectionProps = {
  type: LibraryType
  data?: Library[]
}

function resolveLabelForType(type: LibraryType) {
  if (type === 'local') return 'Library'
  if (type === 'remote') return 'Online'

  return capitalize(type)
}

function LibrarySection({ type, data }: LibrarySectionProps) {
  return (
    <MenuSection label={resolveLabelForType(type)}>
      {data?.map((item) => (
        <MenuItem
          key={item.id}
          href={`/library/${item.id}`}
          label={item.name}
          icon={item.icon}
        />
      ))}
    </MenuSection>
  )
}

export default function Menu() {
  const libraries = useLibraries()
  const getLibraries = createLibraryTypeFilter(libraries)

  const menuOpen = useStore((state) => state['menu.open'])
  const toggleMenu = useStore((state) => state.toggleMenu)

  const handleToggleClick = () => {
    toggleMenu()
  }

  return (
    <Container $isOpen={menuOpen}>
      <StyledLogo />
      <ToggleButton onClick={handleToggleClick}>
        {menuOpen ? <CollapseIcon /> : <ExpandIcon />}
      </ToggleButton>
      <Nav>
        <LibrarySection type="local" data={getLibraries('local')} />
        <LibrarySection type="remote" data={getLibraries('remote')} />
        <LibrarySection type="collection" data={getLibraries('collection')} />
      </Nav>
    </Container>
  )
}
