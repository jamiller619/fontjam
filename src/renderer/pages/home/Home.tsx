import { Box, Flex, Portal, ScrollArea, Text } from '@radix-ui/themes'
// import { Fragment } from 'react'
// import { Outlet } from 'react-router-dom'
import styled from 'styled-components'

// import { FontCard } from '~/components/cards'
// import CardsContainer from '~/components/cards/CardsContainer'
// import { Toolbar } from '~/components/toolbar'
// import useFonts from '~/hooks/useFonts'

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

export default function Home() {
  return null
  // const localFonts = useFonts()
  // const entries = Object.entries(localFonts)
  // const el = document.querySelector(
  //   '[data-is-root-theme="true"]'
  // ) as HTMLElement | null

  // return (
  //   <Fragment>
  //     <Toolbar />
  //     <ScrollArea type="hover" scrollbars="vertical">
  //       <Content>
  //         <CardsContainer>
  //           {entries.map(([fontName, fonts], i) => (
  //             <FontCard key={i} fontName={fontName} fonts={fonts} />
  //           ))}
  //         </CardsContainer>
  //       </Content>
  //     </ScrollArea>
  //     <Footer>
  //       <Text size="1">{entries.length} fonts</Text>
  //     </Footer>
  //     <Portal container={el}>
  //       <Outlet />
  //     </Portal>
  //   </Fragment>
  // )
}
