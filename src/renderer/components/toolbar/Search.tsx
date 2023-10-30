import { Search16Regular as SearchIcon } from '@fluentui/react-icons'
import { Flex } from '@radix-ui/themes'
import { HTMLAttributes } from 'react'
import styled from 'styled-components'
import { Textbox } from '~/components/input'

type SearchProps = HTMLAttributes<HTMLDivElement>

const Container = styled(Flex)`
  padding: var(--space-3);
  background-color: var(--gray-surface);
  align-items: center;
  justify-content: center;
`

const Searchbox = styled(Textbox).attrs({
  type: 'search',
  size: '3',
})`
  width: 350px;
`

export default function Search(props: SearchProps) {
  return (
    <Container {...props}>
      <Searchbox icon={<SearchIcon />} />
    </Container>
  )
}
