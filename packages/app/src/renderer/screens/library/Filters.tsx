import {
  Grid20Filled as GridIcon,
  TextBulletList20Filled as ListIcon,
} from '@fluentui/react-icons'
import { Flex, IconButton as RUIIconButton } from '@radix-ui/themes'
import { styled } from 'styled-components'
import useClassNames from '~/hooks/useClassNames'
import { useStore } from '~/store'
import { control } from '~/style/styles'

const IconButton = styled(RUIIconButton).attrs({
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

const IconButtonContainer = styled(Flex)`
  gap: calc(var(--space-4) + 3px);
`

export default function Filters() {
  const view = useStore((state) => state['library.filters.view'])
  const setView = useStore((state) => state.setLibraryView)

  const handleViewChange = (view: 'grid' | 'list') => {
    return function viewChangeHandler() {
      setView(view)
    }
  }

  const gridClassName = useClassNames({
    active: view === 'grid',
  })

  const listClassName = useClassNames({
    active: view === 'list',
  })

  return (
    <IconButtonContainer>
      <IconButton {...gridClassName} onClick={handleViewChange('grid')}>
        <GridIcon />
      </IconButton>
      <IconButton {...listClassName} onClick={handleViewChange('list')}>
        <ListIcon />
      </IconButton>
    </IconButtonContainer>
  )
}
