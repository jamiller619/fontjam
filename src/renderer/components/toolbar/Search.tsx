import {
  DismissCircle16Filled as CancelIcon,
  Search16Filled as SearchIcon,
} from '@fluentui/react-icons'
import { Flex, IconButton } from '@radix-ui/themes'
import { HTMLAttributes, useRef } from 'react'
import styled, { css } from 'styled-components'
import { useSessionStorage } from 'usehooks-ts'
import { Textbox } from '~/components/input'
import useIsFocused from '~/hooks/useIsFocused'

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

const CancelButton = styled(IconButton).attrs({
  variant: 'ghost',
  color: 'gray',
})<{ $isVisible: boolean }>`
  opacity: 1;
  pointer-events: all;
  transition: opacity 150ms ease-out;

  ${({ $isVisible }) => {
    return (
      $isVisible === false &&
      css`
        opacity: 0;
        pointer-events: none;
      `
    )
  }}
`

export default function Search(props: SearchProps) {
  const ref = useRef<HTMLInputElement>(null)
  const isFocused = useIsFocused(ref)
  const [searchText, setSearchText] = useSessionStorage('searchText', '')

  return (
    <Container {...props}>
      <Searchbox
        icon={<SearchIcon />}
        ref={ref}
        value={searchText ?? ''}
        onChange={(e) => setSearchText(e.target.value)}>
        <CancelButton $isVisible={isFocused}>
          <CancelIcon />
        </CancelButton>
      </Searchbox>
    </Container>
  )
}
