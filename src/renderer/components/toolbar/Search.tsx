import { Search20Filled as SearchIcon } from '@fluentui/react-icons'
import { Flex } from '@radix-ui/themes'
import { HTMLAttributes, useRef } from 'react'
import styled from 'styled-components'
import { useSessionStorage } from 'usehooks-ts'
import { Textbox } from '~/components/input'

type SearchProps = HTMLAttributes<HTMLDivElement>

const Container = styled(Flex)`
  align-items: center;
  justify-content: center;
  transform: scale(1);
  /* transition: transform 130ms cubic-bezier(1, 0, 0.5, 1),
    box-shadow 130ms ease-in-out; */
  border-radius: var(--radius-4);
`

const Searchbox = styled(Textbox).attrs({
  type: 'search',
  size: '3',
})`
  width: 350px;
`

export function useSearch() {
  const [searchText, setSearchText] = useSessionStorage('searchText', '')

  return [searchText, setSearchText] as const
}

export default function Search(props: SearchProps) {
  const ref = useRef<HTMLInputElement>(null)
  const [searchText, setSearchText] = useSearch()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  return (
    <Container {...props}>
      <Searchbox
        icon={<SearchIcon />}
        ref={ref}
        value={searchText ?? ''}
        onChange={handleSearchChange}
      />
    </Container>
  )
}
