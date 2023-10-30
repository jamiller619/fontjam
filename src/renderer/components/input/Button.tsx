import { Button as RUIButton } from '@radix-ui/themes'
import { ComponentProps } from 'react'
import styled from 'styled-components'

type ButtonProps = ComponentProps<typeof RUIButton>

const Container = styled(RUIButton).attrs({
  size: '1',
})`
  --base-button-height: var(--space-7);

  cursor: pointer;
  border-radius: var(--radius-5);
  font-size: var(--font-size-2);
  padding: var(--space-3) var(--space-2);
  transition: background-color 150ms ease-in-out;
  margin: 0;
`

export default function Button(props: ButtonProps) {
  return <Container color="gray" variant="soft" {...props} />
}

const ButtonLinkContainer = styled(Container)`
  &:hover {
    background-color: var(--gray-a3);
  }
`

Button.Link = function LinkButton(props: ButtonProps) {
  return <ButtonLinkContainer variant="ghost" {...props} />
}

const PrimaryButtonContainer = styled(Container)`
  &:hover {
    background-color: var(--accent-7);
  }
`

Button.Primary = function PrimaryButton(props: ButtonProps) {
  return <PrimaryButtonContainer variant="solid" radius="full" {...props} />
}
