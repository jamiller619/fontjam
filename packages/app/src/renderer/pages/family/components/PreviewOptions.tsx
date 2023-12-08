import {
  TextFontSize24Filled as TextLargeIcon,
  TextFontSize16Filled as TextSmallIcon,
} from '@fluentui/react-icons'
import { Flex, Slider, Text, TextArea } from '@radix-ui/themes'
import { ChangeEvent } from 'react'
import styled from 'styled-components'
import { useAppStateTest } from '~/hooks/useAppState'
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

const TextSizeDisplay = styled('div')`
  width: 42px;
  text-align: right;
`

export default function PreviewOptions() {
  const [state, setState] = useAppStateTest('preview.size', 'preview.text')

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setState({
      'preview.text': e.target.value,
    })
  }

  const handleSizeChange = (value: number[]) => {
    setState({
      'preview.size': value.at(0),
    })
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
              defaultValue={[state['preview.size']]}
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
      <TextArea
        mt="2"
        value={state['preview.text']}
        onChange={handleTextChange}
      />
    </Container>
  )
}
