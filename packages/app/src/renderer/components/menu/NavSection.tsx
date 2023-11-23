import { AddCircle16Regular as AddIcon } from '@fluentui/react-icons'
import { Flex, Heading, IconButton } from '@radix-ui/themes'
import { MouseEvent, ReactNode, useRef } from 'react'
import { styled } from 'styled-components'
import useAnimatedNavigate from '~/hooks/useAnimatedNavigate'
import useAppState from '~/hooks/useAppState'

type NavSectionProps = {
  children?: ReactNode
  label?: string
}

const Container = styled(Flex)`
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
`

const Label = styled(Heading)`
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--gray-8);
  width: auto;
  position: absolute;
  left: 0;
`

const Navlist = styled('ol')`
  list-style: none;
  margin: 0 0 var(--space-2) 0;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
`

const Header = styled(Flex)`
  align-items: center;
  margin: 0 10px;
  height: 16px;
  position: relative;
`

const AddButton = styled(IconButton).attrs({
  color: 'gray',
  variant: 'ghost',
})`
  color: var(--gray-10);
  position: absolute;
  right: 5px;
  top: -2px;
  cursor: pointer;
`

export default function NavSection({ children, label }: NavSectionProps) {
  const ref = useRef(null)
  const [state] = useAppState()
  const navigate = useAnimatedNavigate()

  const handleAddClick = (e: MouseEvent) => {
    e.preventDefault()

    if (label) {
      navigate(`/add/${label.toLowerCase()}`)
    }
  }

  return (
    <Container>
      <Header className="navSectionHeader">
        <Label>
          <span>{label}</span>
        </Label>
        {state['menu.open'] && (
          <AddButton onClick={handleAddClick}>
            <AddIcon />
          </AddButton>
        )}
      </Header>
      <Navlist ref={ref}>{children}</Navlist>
    </Container>
  )
}
