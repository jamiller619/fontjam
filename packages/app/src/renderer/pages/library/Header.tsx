import {
  Grid20Filled as GridIcon,
  TextBulletList20Filled as ListIcon,
} from '@fluentui/react-icons'
import { Flex, IconButton } from '@radix-ui/themes'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import useAppState from '~/hooks/useAppState'
import useClassNames from '~/hooks/useClassNames'
import { control } from '~/style/styles'
import Search from './Search'

type HeaderProps = HTMLAttributes<HTMLDivElement>

const Controls = styled(Flex)`
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3);
`

const StyledSearch = styled(Search)`
  -webkit-app-region: no-drag;
`

const Container = styled(Flex)`
  flex-direction: column;
  justify-content: space-between;
  z-index: 1;
  -webkit-app-region: drag;
  background: var(--gray-surface);
`

const HeaderIconButton = styled(IconButton).attrs({
  variant: 'ghost',
  radius: 'large',
  size: '2',
})`
  -webkit-app-region: no-drag;
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

const HeaderIconButtonContainer = styled(Flex)`
  gap: calc(var(--space-4) + 3px);
`

export default function Header(props: HeaderProps) {
  const [state, setAppState] = useAppState()

  const handleViewChange = (view: 'grid' | 'list') => {
    return function handler() {
      setAppState((prev) => ({
        ...prev,
        'library.filters.view': view,
      }))
    }
  }

  const gridClassName = useClassNames({
    active: state['library.filters.view'] === 'grid',
  })

  const listClassName = useClassNames({
    active: state['library.filters.view'] === 'list',
  })

  return (
    <Container {...props}>
      <Controls>
        <StyledSearch />
        <HeaderIconButtonContainer>
          <HeaderIconButton
            {...gridClassName}
            onClick={handleViewChange('grid')}>
            <GridIcon />
          </HeaderIconButton>
          <HeaderIconButton
            {...listClassName}
            onClick={handleViewChange('list')}>
            <ListIcon />
          </HeaderIconButton>
        </HeaderIconButtonContainer>
        <div />
      </Controls>
    </Container>
  )
}
