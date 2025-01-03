import { Flex, Separator, Text } from '@radix-ui/themes'
import styled from 'styled-components'
import useAPI from '~/hooks/useAPI'
import { useLibrary } from '~/hooks/useLibrary'
import { useStore } from '~/store'

const Container = styled(Flex)`
  z-index: 1;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  color: var(--gray-9);
  font-weight: 450;
  background-color: var(--gray-1);
  justify-content: end;
`

export default function Footer() {
  const activeLibraryId = useStore((state) => state['library.active.id'])
  const library = useLibrary(activeLibraryId)
  const { data } = useAPI('get.stats', [activeLibraryId!])
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
