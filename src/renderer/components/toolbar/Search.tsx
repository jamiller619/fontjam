import { Search16Filled as SearchIcon } from '@fluentui/react-icons'
import { Flex } from '@radix-ui/themes'
import { HTMLAttributes, useRef } from 'react'
import styled from 'styled-components'
import { useSessionStorage } from 'usehooks-ts'
import { Textbox } from '~/components/input'

type SearchProps = HTMLAttributes<HTMLDivElement>

const Container = styled(Flex)`
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-4);
`

const Searchbox = styled(Textbox).attrs({
  type: 'search',
  size: '2',
})`
  width: 350px;

  &::-webkit-search-cancel-button {
    appearance: none;
  }
`

export default function Search(props: SearchProps) {
  const ref = useRef<HTMLInputElement>(null)
  const [searchText, setSearchText] = useSessionStorage('searchText', '')

  return (
    <Container {...props}>
      <Searchbox
        icon={<SearchIcon />}
        ref={ref}
        value={searchText ?? ''}
        onChange={(e) => setSearchText(e.target.value)}
      />
    </Container>
  )
}
