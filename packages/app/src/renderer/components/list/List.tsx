import { Flex } from '@radix-ui/themes'
import { HTMLAttributes, ReactNode } from 'react'
import styled, { css } from 'styled-components'

type ListProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
}

type ListItemProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  $isActive?: boolean
}

export const ListItem = styled(Flex)<ListItemProps>`
  background-color: var(--gray-a3);
  border-radius: var(--radius-2);
  align-items: center;
  padding: var(--space-3);
  transition: background-color 120ms ease-in-out;

  &:hover {
    background-color: var(--gray-a4);
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      background-color: var(--gray-a5);

      &:hover {
        background-color: var(--gray-a5);
      }
    `}
`

const Container = styled(Flex)`
  flex-direction: column;
  gap: var(--space-1);
`

export default function List({ children, ...props }: ListProps) {
  return <Container {...props}>{children}</Container>
}
