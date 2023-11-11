import { ChevronLeft20Filled as IndexIcon } from '@fluentui/react-icons'
import { Box, Flex, Heading, ScrollArea, Select, Tabs } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import { useIsMounted } from 'usehooks-ts'
import { FamilyFont } from '@shared/types'
import AnimatedLink from '~/components/AnimatedLink'
import { Preview } from '~/components/preview'
import PreviewOptions from '~/components/preview/PreviewOptions'
import useAPI from '~/hooks/useAPI'
import useFontData from '~/hooks/useFontData'
import Glyphs from './Glyphs'
import Tables from './Tables'

const Container = styled(Box)`
  /* background-color: var(--gray-3);
  width: calc(100vw - 10vh);
  height: calc(100vh - 10vh); */
  view-transition-name: card;
  /* overflow-y: auto;
  overflow-x: hidden; */
  /* position: fixed; */
  /* inset: 5vh; */
  /* -webkit-app-region: no-drag; */
  z-index: 3;
  /* border-radius: var(--radius-6); */
  /* padding: var(--space-5); */
  /* box-shadow: var(--shadow-5); */
`

const BackLink = styled(AnimatedLink)`
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--accent-9);
`

const PageHeading = styled(Heading).attrs({
  size: '8',
})`
  margin-bottom: var(--space-2);
  font-weight: 600;
  view-transition-name: heading;
  padding: 0 var(--space-3);
`

const anim = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0px);
  }
`

let staggerIndex = 0

const fadeinStyles = () => {
  const delay = 200 + 100 * staggerIndex

  staggerIndex += 1

  return css`
    animation: 200ms both ${delay}ms ease-in-out ${anim};
  `
}

const StyledPreview = styled(Preview)`
  view-transition-name: preview;
  margin: var(--space-3) 0;
  padding: var(--space-2);
  border: 1px solid var(--gray-5);
`

const TabHeader = styled(Box)`
  border-bottom: 1px solid var(--gray-7);
  color: var(--accent-9);
  -webkit-app-region: drag;
  padding-left: var(--space-6);
`

const TabsList = styled(Tabs.List)`
  box-shadow: none;
  margin-bottom: -1px;
  -webkit-app-region: no-drag;
`

const ContentBox = styled(Box)`
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
  flex-direction: row;
  gap: var(--space-4);

  ${ContentBox} {
    width: 50%;
    overflow-x: hidden;
  }
`

const StyledTables = styled(Tables)`
  max-width: 45vw;
  overflow: hidden;

  ${fadeinStyles()}
`

const Header = styled(Flex)`
  -webkit-app-region: drag;
  padding: var(--space-3);

  ${BackLink} {
    -webkit-app-region: no-drag;
  }
`

const TabContent = styled(Box)`
  padding: 0 var(--space-3);
`

const StyledGlyphs = styled(Glyphs)`
  ${fadeinStyles()}
`

type Preview = {
  size: number
  text: string
}

export default function Family() {
  const { name, libraryId } = useParams()
  const { data: family } = useAPI('get.family', [Number(libraryId), name], {
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
    <Container>
      {/* <Header>
        <BackLink to={`/library/${libraryId}`}>
          <IndexIcon /> Back
        </BackLink>
      </Header> */}
      <Tabs.Root value={activeFont?.fullName} onValueChange={handleFontChange}>
        <TabHeader>
          <Flex>
            <BackLink to={`/library/${libraryId}`}>
              <IndexIcon />
            </BackLink>
            <PageHeading>{family?.name}</PageHeading>
          </Flex>
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
        </TabHeader>
        <TabContent>
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
                <StyledGlyphs data={fontData} />
              </ContentBox>
            </Content>
          ))}
        </TabContent>
      </Tabs.Root>
    </Container>
  )
}
