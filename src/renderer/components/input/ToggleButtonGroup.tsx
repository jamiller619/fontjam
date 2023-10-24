import * as ToggleGroup from '@radix-ui/react-toggle-group'
import { ReactNode } from 'react'
import { styled } from 'styled-components'

export type ToggleButtonGroupItem = {
  value: string
  content: ReactNode
}

type ToggleButtonGroupProps = {
  defaultValue: string
  items: ToggleButtonGroupItem[]
  onChange?: (value: string) => void
}

const ToggleGroupItem = styled(ToggleGroup.Item)`
  color: var(--accent-9-contrast);
  border: none;
  padding: var(--space-1) var(--space-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &[data-state='on'] {
    background-color: var(--accent-9);
  }

  &:first-child {
    border-top-left-radius: var(--radius-4);
    border-bottom-left-radius: var(--radius-4);
  }

  &:last-child {
    border-top-right-radius: var(--radius-4);
    border-bottom-right-radius: var(--radius-4);
  }
`

export default function ToggleButtonGroup({
  defaultValue,
  items,
  onChange,
}: ToggleButtonGroupProps) {
  return (
    <ToggleGroup.Root
      type="single"
      defaultValue={defaultValue}
      onValueChange={onChange}>
      {items.map((item) => (
        <ToggleGroupItem key={item.value} value={item.value}>
          {item.content}
        </ToggleGroupItem>
      ))}
    </ToggleGroup.Root>
  )
}
