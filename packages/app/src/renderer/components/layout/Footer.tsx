import { Flex, Separator, Text } from '@radix-ui/themes'
import styled from 'styled-components'
import useAPI from '~/hooks/useAPI'
import useAppState from '~/hooks/useAppState'
import { useLibrary } from '~/hooks/userLibrary'

const Container = styled(Flex)`
  z-index: 1;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  color: var(--gray-10);
  background-color: var(--gray-0);
  justify-content: end;
`

export default function Footer() {
  const [state] = useAppState()
  const library = useLibrary(state['library.active.id'])
  const { data } = useAPI('get.stats', [state['library.active.id'], 'local'])
  const fontCount = data?.fonts || 0
  const familyCount = data?.families || 0

  return (
    <Container>
      <Flex gap="2">
        <Text size="1">{library?.name} library</Text>
        <Separator orientation="vertical" />
        <Text size="1">{library?.path}</Text>
        <Separator orientation="vertical" />
        <Text size="1">
          {fontCount} fonts in {familyCount} families
        </Text>
      </Flex>
    </Container>
  )
}
