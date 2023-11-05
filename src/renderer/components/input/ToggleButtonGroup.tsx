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
  padding: var(--space-1) var(--space-3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  outline: none;
  border: none;
  box-shadow: none;
  /* background: var(--gray-3); */
  background: transparent;
  color: var(--gray-10);
  cursor: pointer;

  &:hover {
    background-color: var(--gray-a2);
    color: var(--gray-12);
  }

  &[data-state='on'] {
    background-color: var(--gray-a3);
    color: var(--gray-12);
  }

  &:first-child {
    border-top-left-radius: var(--radius-3);
    border-bottom-left-radius: var(--radius-3);
  }

  &:last-child {
    border-top-right-radius: var(--radius-3);
    border-bottom-right-radius: var(--radius-3);
  }
`

const Root = styled(ToggleGroup.Root)``

export default function ToggleButtonGroup({
  defaultValue,
  items,
  onChange,
}: ToggleButtonGroupProps) {
  return (
    <Root type="single" defaultValue={defaultValue} onValueChange={onChange}>
      {items.map((item) => (
        <ToggleGroupItem key={item.value} value={item.value}>
          {item.content}
        </ToggleGroupItem>
      ))}
    </Root>
  )
}
