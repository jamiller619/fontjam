import { ChevronLeft20Filled as IndexIcon } from '@fluentui/react-icons'
import { Box, Flex, Heading, ScrollArea, Select, Tabs } from '@radix-ui/themes'
import { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { FamilyFont } from '@shared/types'
import AnimatedLink from '~/components/AnimatedLink'
import Backdrop from '~/components/Backdrop'
import { Preview } from '~/components/preview'
import PreviewOptions from '~/components/preview/PreviewOptions'
import useAPI from '~/hooks/useAPI'
import useFontData from '~/hooks/useFontData'
import Glyphs from './Glyphs'
import Tables from './Tables'

const Container = styled(Box)`
  background-color: var(--gray-3);
  width: calc(100vw - 10vh);
  height: calc(100vh - 10vh);
  view-transition-name: card;
  overflow-y: auto;
  overflow-x: hidden;
  position: fixed;
  inset: 5vh;
  -webkit-app-region: no-drag;
  z-index: 3;
  border-radius: var(--radius-6);
  padding: var(--space-5);
  box-shadow: var(--shadow-5);
`

const BackLink = styled(AnimatedLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--accent-9);
`

const PageHeading = styled(Heading).attrs({
  size: '8',
})`
  margin-top: var(--space-4);
  margin-bottom: var(--space-1);
  font-weight: 600;
  view-transition-name: heading;
`

const StyledPreview = styled(Preview)`
  view-transition-name: preview;
  margin: var(--space-3) 0;
  padding: var(--space-2);
  border: 1px solid var(--gray-5);
`

const Header = styled(Flex)`
  align-items: end;
  justify-content: space-between;
  border-bottom: 1px solid var(--gray-7);
  color: var(--accent-9);
`

const TabsList = styled(Tabs.List)`
  box-shadow: none;
  margin-bottom: -1px;
`

const ContentBox = styled(ScrollArea).attrs({
  scrollbars: 'vertical',
})`
  /* height: 65vh;
  width: 45vw;
  overflow: hidden; */
  padding: var(--space-4) 0;
`

const ContentBoxHeader = styled(Heading).attrs({
  size: '5',
})`
  margin-bottom: var(--space-3);
  font-weight: 500;
`

const Content = styled(Tabs.Content)`
  display: flex;
  gap: var(--space-4);

  ${ContentBox} {
    flex: 1;
  }
`

const StyledTables = styled(Tables)`
  max-width: 45vw;
  overflow: hidden;
`

type Preview = {
  size: number
  text: string
}

export default function Family() {
  const { name, id } = useParams()
  const { data: family } = useAPI('get.family', [Number(id), name], {
    revalidateOnReconnect: false,
  })

  const [activeFont, setActiveFont] = useState<FamilyFont | undefined>(
    family?.fonts.at(0)
  )

  const [preview] = useState<Preview>({
    size: 32,
    text: 'The quick brown fox jumps over the lazy dog',
  })

  const handleFontChange = (fontName: string) => {
    const font = family?.fonts.find((f) => f.fullName === fontName)

    if (font) setActiveFont(font)
  }

  const fontData = useFontData(activeFont?.id, activeFont?.fullName)

  useEffect(() => {
    if (activeFont != null || family == null) return

    setActiveFont(family.fonts.at(0))
  }, [activeFont, family])

  return (
    <Fragment>
      <Backdrop />
      <Container>
        <BackLink to={`/library/${id}`}>
          <IndexIcon /> Back
        </BackLink>
        <Tabs.Root
          value={activeFont?.fullName}
          onValueChange={handleFontChange}>
          <Header>
            <PageHeading>{family?.name}</PageHeading>
            <TabsList>
              {(family?.fonts.length ?? 0) > 4 ? (
                <Select.Root
                  value={activeFont?.fullName}
                  onValueChange={handleFontChange}>
                  <Select.Trigger />
                  <Select.Content>
                    {family?.fonts.map((font) => (
                      <Select.Item key={font.id} value={font.fullName}>
                        {font.fullName}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              ) : (
                family?.fonts.map((font) => (
                  <Tabs.Trigger key={font.id} value={font.fullName}>
                    {font.fullName}
                  </Tabs.Trigger>
                ))
              )}
            </TabsList>
          </Header>
          <Box>
            {family?.fonts.map((font) => (
              <Content key={font.id} value={font.fullName}>
                <ContentBox>
                  <ContentBoxHeader>Preview</ContentBoxHeader>
                  <PreviewOptions />
                  <StyledPreview id={font.id} name={font.fullName} size={36}>
                    {preview.text}
                  </StyledPreview>
                  <StyledTables data={fontData?.tables} />
                </ContentBox>
                <ContentBox>
                  <ContentBoxHeader>Glyphs</ContentBoxHeader>
                  <Glyphs data={fontData} />
                </ContentBox>
              </Content>
            ))}
          </Box>
        </Tabs.Root>
      </Container>
    </Fragment>
  )
}
