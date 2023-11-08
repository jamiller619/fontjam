import {
  Flex,
  RadioGroup,
  Select,
  Slider,
  Text,
  TextArea,
} from '@radix-ui/themes'
import { ChangeEvent, useState } from 'react'
import styled from 'styled-components'
import { Textbox } from '~/components/input'

const RadioContainer = styled(RadioGroup.Root).attrs({
  size: '1',
})`
  display: flex;
  gap: var(--space-5);
`

const Label = styled(Text).attrs({
  as: 'label',
})`
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
`

const Row = styled('tr')`
  td:first-child {
    width: 25%;
  }

  td {
    padding: var(--space-2) 0;
  }
`

const StyledSlider = styled(Slider)`
  width: 50%;
`

const pangramOptions = [
  'The quick brown fox jumps over the lazy dog.',
  'Waltz, bad nymph, for quick jigs vex.',
  'Glib jocks quiz nymph to vex dwarf.',
  'Pack my box with five dozen liquor jugs.',
]

type PreviewType = 'pangram' | 'alphabet' | 'custom'

type PreviewState = {
  type: PreviewType
  value: string
  size: number
}

export default function PreviewOptions() {
  const [state, setState] = useState<PreviewState>({
    type: 'pangram',
    value: pangramOptions[0],
    size: 50,
  })

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setState((prev) => ({
      ...prev,
      value: e.target.value,
    }))
  }

  return <TextArea value={state.value} onChange={handleChange} />
}
