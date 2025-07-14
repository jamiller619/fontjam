import {
  TextFontSize24Filled as TextLargeIcon,
  TextFontSize16Filled as TextSmallIcon,
} from '@fluentui/react-icons'
import { Flex, Slider, Text, TextArea } from '@radix-ui/themes'
import { ChangeEvent } from 'react'
import styled from 'styled-components'
import { useStore } from '~/store'
import { Store } from '~/store/useStore'
import TextOptions from './TextOptions'

const Container = styled(Flex).attrs({
  direction: 'column',
  gap: '1',
})``

const TextSizeContainer = styled('div')`
  flex: 1;
`

const OptionContainer = styled(Flex).attrs({
  align: 'center',
  gap: '2',
})`
  flex: 1;
`

function selector(state: Store) {
  return {
    previewSize: state['preview.size'],
    previewText: state['preview.text'],
    setPreviewSize: state.updatePreviewSize,
    setPreviewText: state.updatePreviewText,
  }
}

export default function PreviewOptions() {
  const { previewSize, previewText, setPreviewSize, setPreviewText } =
    useStore(selector)

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setPreviewText(e.target.value)
  }

  const handleSizeChange = (value: number[]) => {
    setPreviewSize(value.at(0)!)
  }

  return (
    <Container>
      <Flex align="center" gap="2">
        <OptionContainer>
          <Text size="2">Text:</Text>
          <TextOptions />
        </OptionContainer>
        <OptionContainer>
          <TextSmallIcon />
          <TextSizeContainer>
            <Slider
              defaultValue={[previewSize]}
              min={8}
              max={200}
              onValueChange={handleSizeChange}
              size="1"
            />
          </TextSizeContainer>
          <TextLargeIcon />
          {/* <TextSizeDisplay>
            <Text size="2">{state['preview.size']}px</Text>
          </TextSizeDisplay> */}
        </OptionContainer>
      </Flex>
      <TextArea mt="2" value={previewText} onChange={handleTextChange} />
    </Container>
  )
}
