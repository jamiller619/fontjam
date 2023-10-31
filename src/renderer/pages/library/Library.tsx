import {
  Box,
  Flex,
  Portal,
  ScrollArea,
  Separator,
  Text,
} from '@radix-ui/themes'
import { Fragment, useMemo } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { Card } from '~/components/card'
import CardsContainer from '~/components/card/CardsContainer'
import { Toolbar } from '~/components/toolbar'
import useAPI from '~/hooks/useAPI'
import useAppState from '~/hooks/useAppState'
import useLibrary from '~/hooks/useLibrary'

const Content = styled(Box)`
  margin: calc(var(--scale-1) / 2) 0;
`

const Footer = styled(Flex)`
  align-items: center;
  padding: 0 var(--space-3);
  color: var(--gray-11);
  height: 35px;
  background-color: var(--gray-surface);
  border-top-left-radius: var(--radius-3);
  justify-content: space-between;
`

export default function Library() {
  const { id } = useParams()
  const library = useLibrary(Number(id))
  const [{ view }] = useAppState()
  const { data } = useAPI('get.fonts', [Number(id), { index: 0, length: 48 }], {
    refreshWhenHidden: false,
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateIfStale: false,
  })

  const fontsLength = useMemo(() => {
    return data?.records.reduce((acc, curr) => acc + curr.fonts.length, 0)
  }, [data?.records])

  const el = document.querySelector(
    '[data-is-root-theme="true"]'
  ) as HTMLElement | null

  return (
    <Fragment>
      <Toolbar />
      <ScrollArea type="hover" scrollbars="vertical">
        <Content>
          <CardsContainer view={view}>
            {data?.records.map((family) => (
              <Card key={family.name} family={family} />
            ))}
          </CardsContainer>
        </Content>
      </ScrollArea>
      <Footer>
        <Text size="1">
          <strong>{fontsLength} fonts</strong> in{' '}
          <strong>{data?.total} families</strong>
        </Text>
        <Text size="1" align="right">
          <Flex align="center" gap="2">
            <span>
              Library <strong>{library?.name}</strong>
            </span>
            <Separator orientation="vertical" /> {library?.path}
          </Flex>
        </Text>
      </Footer>
      <Portal container={el}>
        <Outlet />
      </Portal>
    </Fragment>
  )
}
