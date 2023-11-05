import { Flex, Separator, Text } from '@radix-ui/themes'
// import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { useLibrary } from '~/hooks/useCatalog'

const Container = styled(Flex)`
  align-items: center;
  padding: var(--space-2) var(--space-3);
  color: var(--gray-10);
  background-color: var(--gray-a1);
  justify-content: space-between;
`

export default function Footer() {
  const { id } = useParams()
  const library = useLibrary(id)

  // const fontsLength = useMemo(() => {
  //   return data?.records.reduce((acc, curr) => acc + curr.fonts.length, 0)
  // }, [data?.records])
  const fontsLength = 0
  const data = { total: 0 }

  return (
    <Container>
      <Text size="1">
        {fontsLength} fonts in {data?.total} families
      </Text>
      <Text size="1" align="right">
        <Flex align="center" gap="2">
          <span>Library {library?.name}</span>
          <Separator orientation="vertical" /> {library?.path}
        </Flex>
      </Text>
    </Container>
  )
}
