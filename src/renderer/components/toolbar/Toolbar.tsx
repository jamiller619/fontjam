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

type ToolbarProps = HTMLAttributes<HTMLDivElement>

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

const ToolbarIconButton = styled(IconButton).attrs({
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

const ToolbarIconButtonContainer = styled(Flex)`
  gap: calc(var(--space-4) + 3px);
`

export default function Toolbar(props: ToolbarProps) {
  const [state, setAppState] = useAppState()

  const handleViewChange = (view: 'grid' | 'list') => {
    return function handler() {
      setAppState((prev) => ({
        ...prev,
        'catalog.filters.view': view,
      }))
    }
  }

  const gridClassName = useClassNames({
    active: state['catalog.filters.view'] === 'grid',
  })

  const listClassName = useClassNames({
    active: state['catalog.filters.view'] === 'list',
  })

  return (
    <Container {...props}>
      <Controls>
        <StyledSearch />
        <ToolbarIconButtonContainer>
          <ToolbarIconButton
            {...gridClassName}
            onClick={handleViewChange('grid')}>
            <GridIcon />
          </ToolbarIconButton>
          <ToolbarIconButton
            {...listClassName}
            onClick={handleViewChange('list')}>
            <ListIcon />
          </ToolbarIconButton>
        </ToolbarIconButtonContainer>
        <div />
      </Controls>
    </Container>
  )
}
