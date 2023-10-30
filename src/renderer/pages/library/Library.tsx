import { Box, Flex, Portal, ScrollArea, Text } from '@radix-ui/themes'
import { Fragment } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { FontCard } from '~/components/cards'
import CardsContainer from '~/components/cards/CardsContainer'
import { Toolbar } from '~/components/toolbar'
import { useLibraryFonts } from '~/hooks/useLibrary'

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
`

export default function Library() {
  const { id } = useParams()
  const { library, fonts } = useLibraryFonts(id)
  const entries = Object.entries(fonts)
  const el = document.querySelector(
    '[data-is-root-theme="true"]'
  ) as HTMLElement | null

  return (
    <Fragment>
      <Toolbar />
      <ScrollArea type="hover" scrollbars="vertical">
        <Content>
          <CardsContainer>
            {entries.map(([fontName, fonts], i) => (
              <FontCard key={i} fontName={fontName} fonts={fonts} />
            ))}
          </CardsContainer>
        </Content>
      </ScrollArea>
      <Footer>
        <Text size="1">
          {library?.name}: {entries.length} fonts
        </Text>
      </Footer>
      <Portal container={el}>
        <Outlet />
      </Portal>
    </Fragment>
  )
}
