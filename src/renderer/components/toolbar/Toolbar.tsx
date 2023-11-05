import {
  Grid20Regular as GridIcon,
  TextBulletList20Regular as ListIcon,
} from '@fluentui/react-icons'
import { Flex, IconButton, Slider } from '@radix-ui/themes'
import styled from 'styled-components'
import {
  Textbox,
  ToggleButtonGroup,
  ToggleButtonGroupItem,
} from '~/components/input'
import useAppState from '~/hooks/useAppState'
import useClassNames from '~/hooks/useClassNames'
import Search from './Search'

const Container = styled(Flex)`
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  height: 80px;
  transition: height 150ms ease-in-out;
  z-index: 1;
`

const DragRegion = styled('div')`
  -webkit-app-region: drag;
  height: 30px;
`

const views: ToggleButtonGroupItem[] = [
  {
    value: 'grid',
    content: <GridIcon />,
  },
  {
    value: 'list',
    content: <ListIcon />,
  },
]

const PreviewTextbox = styled(Textbox)`
  width: 350px;
`

const SizeTextbox = styled(Textbox).attrs({
  type: 'number',
})`
  width: 40px;
`

const Section = styled(Flex).attrs({
  align: 'center',
  gap: '2',
})`
  flex-grow: 1;
`

const ToolbarSlider = styled(Slider)`
  flex-grow: 1;
`

const Items = styled(Flex)`
  align-items: center;
  justify-content: space-evenly;
`

const ToolbarIconButton = styled(IconButton).attrs({
  variant: 'ghost',
  color: 'gray',
  radius: 'large',
  size: '3',
})`
  cursor: pointer;
  color: var(--gray-10);
  transition: background-color 150ms ease-in-out, color 150ms ease-in-out;

  &:hover,
  &.active {
    color: var(--gray-12);
  }

  &.active {
    background-color: var(--gray-a2);
  }
`

const ToolbarIconButtonContainer = styled(Flex)`
  gap: var(--space-5);
`

export default function Toolbar() {
  const [{ previewText, view, previewFontSize }, setAppState] = useAppState()

  const handleViewChange = (view: 'grid' | 'list') => {
    return function handler() {
      setAppState((prev) => ({
        ...prev,
        view,
      }))
    }
  }

  const handleSizeChange = (value: number) => {
    setAppState((prev) => ({
      ...prev,
      previewFontSize: value ?? previewFontSize,
    }))
  }

  const gridClassName = useClassNames({
    active: view === 'grid',
  })

  const listClassName = useClassNames({
    active: view === 'list',
  })

  return (
    <Container>
      <DragRegion />
      <Items>
        <div />
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
        <Search />
        {/* <ToggleButtonGroup
          defaultValue={view}
          items={views}
          onChange={handleViewChange}
        /> */}
      </Items>
      {/* <Section>
        <Text size="2">Preview:</Text>
        <PreviewTextbox defaultValue={previewText} />
      </Section>
      <Section>
        <Text size="2">Size:</Text>
        <ToolbarSlider
          value={[previewFontSize]}
          min={8}
          max={64}
          size="1"
          onValueChange={(val) => handleSizeChange(val[0])}
        />
        <SizeTextbox
          value={previewFontSize}
          onChange={(e) => handleSizeChange(e.target.valueAsNumber)}
        />
      </Section>
      <ToggleButtonGroup
        defaultValue={view}
        items={views}
        onChange={handleViewChange}
      /> */}
    </Container>
  )
}
