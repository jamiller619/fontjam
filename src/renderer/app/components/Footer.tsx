import { Flex, Separator, Text } from '@radix-ui/themes'
import styled from 'styled-components'
import useAPI from '~/hooks/useAPI'
import useAppState from '~/hooks/useAppState'
import { useLibrary } from '~/hooks/useCatalog'

const Container = styled(Flex)`
  /* position: fixed; */
  /* left: 0;
  bottom: 0;
  right: 0; */
  z-index: 1;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  color: var(--gray-10);
  background-color: var(--gray-3);
  border-top: var(--default-border);
  justify-content: end;
`

export default function Footer() {
  const [state] = useAppState()
  const library = useLibrary(state['catalog.active.id'])
  const { data } = useAPI('get.stats', [state['catalog.active.id'], 'library'])
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
