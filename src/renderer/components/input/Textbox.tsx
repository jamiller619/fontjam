import { TextField } from '@radix-ui/themes'
import { ComponentProps, ReactNode } from 'react'
import styled from 'styled-components'

type TextboxProps = ComponentProps<typeof TextField.Input> & {
  icon?: ReactNode
}

const Container = styled(TextField.Root).attrs({
  radius: 'medium',
})`
  .rt-TextFieldInput {
    height: calc(var(--space-6) + 5px);
    color: var(--gray-a10);

    &:focus {
      color: var(--gray-12);

      + .rt-TextFieldChrome {
        outline: none;
        background-color: var(--gray-a3);
        color: var(--gray-12);
      }
    }
  }

  .rt-TextFieldChrome {
    background-color: var(--gray-a2);
    box-shadow: none;
    border-radius: var(--radius-3);
  }
`

export default function Textbox({ icon, ...props }: TextboxProps) {
  return (
    <Container>
      {icon && <TextField.Slot>{icon}</TextField.Slot>}
      <TextField.Input {...props} />
    </Container>
  )
}
