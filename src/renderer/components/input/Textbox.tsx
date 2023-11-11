import { TextField } from '@radix-ui/themes'
import { ComponentProps, ReactNode, Ref, forwardRef } from 'react'
import styled from 'styled-components'

type TextboxProps = ComponentProps<typeof TextField.Input> & {
  icon?: ReactNode
  children?: ReactNode
}

const Container = styled(TextField.Root)`
  color: var(--gray-a10);

  .rt-TextFieldInput {
    padding-right: var(--space-2);

    &:focus {
      color: var(--gray-12);

      + .rt-TextFieldChrome {
        transition-duration: 0;
        outline: 2px solid var(--accent-7);
        background-color: var(--color-background);
      }
    }
  }

  .rt-TextFieldChrome {
    background-color: var(--gray-a2);
    box-shadow: none;
    transition-duration: 120ms;
    transition-timing-function: ease-in-out;
    transition-property: background-color;
  }

  .rt-TextFieldSlot {
    gap: 0;
    color: inherit;

    svg {
      color: inherit;
    }
  }

  &:hover {
    .rt-TextFieldChrome {
      background-color: var(--gray-a3);
    }
  }
`

function Textbox(
  { icon, radius, color, size, children, ...props }: TextboxProps,
  ref: Ref<HTMLInputElement>
) {
  return (
    <Container radius={radius} color={color} size={size}>
      {icon && <TextField.Slot>{icon}</TextField.Slot>}
      <TextField.Input {...props} ref={ref} />
      {children && <TextField.Slot>{children}</TextField.Slot>}
    </Container>
  )
}

export default forwardRef(Textbox)
