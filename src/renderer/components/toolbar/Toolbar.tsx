import {
  Grid20Regular as GridIcon,
  List20Regular as ListIcon,
} from '@fluentui/react-icons'
import { Flex, Slider, Text } from '@radix-ui/themes'
import { Fragment } from 'react'
import styled from 'styled-components'
import {
  Textbox,
  ToggleButtonGroup,
  ToggleButtonGroupItem,
} from '~/components/input'
import useAppState from '~/hooks/useAppState'
import Search from './Search'

const DragRegion = styled('div')`
  -webkit-app-region: drag;
  background-color: var(--gray-surface);
  height: 30px;
`

const Container = styled(Flex)`
  gap: var(--space-6);
  padding: var(--space-3);
  background-color: var(--gray-surface);
  justify-content: space-between;
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

export default function Toolbar() {
  const [{ previewText, view, previewFontSize }, setAppState] = useAppState()

  const handleViewChange = (value: string) => {
    setAppState((prev) => ({
      ...prev,
      view: value as 'list' | 'grid',
    }))
  }

  const handleSizeChange = (value: number) => {
    setAppState((prev) => ({
      ...prev,
      previewFontSize: value ?? previewFontSize,
    }))
  }

  return (
    <Fragment>
      <DragRegion />
      <Search />
      <Container>
        <Section>
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
        />
      </Container>
    </Fragment>
  )
}
