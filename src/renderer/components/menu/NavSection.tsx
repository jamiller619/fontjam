import { Add12Filled as AddIcon } from '@fluentui/react-icons'
import { Heading } from '@radix-ui/themes'
import { ReactNode, useRef } from 'react'
import { styled } from 'styled-components'
import { useHover } from 'usehooks-ts'
import NavItem from './NavItem'

type NavSectionProps = {
  children?: ReactNode
  label: {
    singular: string
    plural: string
  }
}

const Navlist = styled('ol')`
  list-style: none;
  margin: 0 0 var(--space-2) 0;
  padding: 0;
  display: flex;
  flex-direction: column;
`

const Label = styled(Heading).attrs({
  size: '1',
})`
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gray-10);
  margin: var(--space-3) var(--space-3) var(--space-2) var(--space-3);
`

const ListItem = styled('li')`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const AddItem = styled(NavItem)<{ $isVisible: boolean }>`
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
  color: var(--gray-11);

  &:hover {
    color: var(--gray-12);
  }
`

export default function NavSection({ children, label }: NavSectionProps) {
  const ref = useRef(null)
  const isHovered = useHover(ref)

  return (
    <Navlist ref={ref}>
      <ListItem>
        <Label>{label.plural}</Label>
      </ListItem>
      {children}
      <AddItem
        $isVisible={isHovered}
        href={`/add/${label.singular}`.toLowerCase()}
        icon={<AddIcon />}
        label={`Add ${label.singular}`}
      />
    </Navlist>
  )
}
