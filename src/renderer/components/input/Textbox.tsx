import { TextField } from '@radix-ui/themes'
import { ComponentProps, ReactNode, Ref, forwardRef } from 'react'
import styled from 'styled-components'

type TextboxProps = ComponentProps<typeof TextField.Input> & {
  icon?: ReactNode
}

const Container = styled(TextField.Root)`
  .rt-TextFieldInput {
    height: var(--space-7);
    color: var(--gray-a10);

    &:focus {
      color: var(--gray-12);

      + .rt-TextFieldChrome {
        outline: none;
        background-color: var(--gray-a4);
        color: var(--gray-12);
      }
    }
  }

  .rt-TextFieldChrome {
    background-color: var(--gray-a2);
    box-shadow: none;
    border-radius: var(--radius-3);
    transition: background-color 100ms ease-out;
  }
`

function Textbox(
  { icon, radius, color, size, ...props }: TextboxProps,
  ref: Ref<HTMLInputElement>
) {
  return (
    <Container radius={radius} color={color} size={size}>
      {icon && <TextField.Slot>{icon}</TextField.Slot>}
      <TextField.Input {...props} ref={ref} />
    </Container>
  )
}

export default forwardRef(Textbox)
