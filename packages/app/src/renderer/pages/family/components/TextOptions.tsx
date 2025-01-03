import { Select } from '@radix-ui/themes'
import { useStore } from '~/store'

const textOptions = {
  Pangrams: [
    ['The quick brown fox', 'The quick brown fox jumps over the lazy dog.'],
    ['Waltz, bad nymph', 'Waltz, bad nymph, for quick jigs vex.'],
    ['Glib jocks', 'Glib jocks quiz nymph to vex dwarf.'],
    ['Pack my box', 'Pack my box with five dozen liquor jugs.'],
  ],
}

function getPreviewText(value: string) {
  return textOptions.Pangrams.find(([text]) => text === value)!.at(1)!
}

export default function TextOptions() {
  const setPreviewText = useStore((state) => state.updatePreviewText)

  const handleChange = (value: string) => {
    setPreviewText(getPreviewText(value))
  }

  return (
    <Select.Root onValueChange={handleChange}>
      <Select.Trigger placeholder="Preview Text" />
      <Select.Content>
        {Object.entries(textOptions).map(([label, options]) => (
          <Select.Group key={label}>
            <Select.Label>{label}</Select.Label>
            {options.map(([option]) => (
              <Select.Item key={option} value={option}>
                {option}
              </Select.Item>
            ))}
          </Select.Group>
        ))}
      </Select.Content>
    </Select.Root>
  )
}
