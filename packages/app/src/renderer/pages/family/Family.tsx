import {
  TextFont16Filled as GlyphIcon,
  ChevronLeft20Filled as IndexIcon,
  PreviewLink16Regular as PreviewIcon,
} from '@fluentui/react-icons'
import { Box, Flex, Heading, ScrollArea, Tabs } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { useSearchParams } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import type { Keyframes } from 'styled-components/dist/types'
import { useLocalStorage } from 'usehooks-ts'
import { Font } from '@shared/types'
import AnimatedLink from '~/components/AnimatedLink'
import { Preview } from '~/components/preview'
import useAPI from '~/hooks/useAPI'
import { useAppStateTest } from '~/hooks/useAppState'
import Glyphs from './components/Glyphs'
import PreviewEditor from './components/PreviewEditor'

type FamilyProps = {
  id: number
}

const Header = styled(Flex).attrs({
  justify: 'between',
})`
  background: var(--gray-2);
  padding: var(--space-5) var(--space-3) var(--space-2);
  -webkit-app-region: drag;
`

const BackLink = styled(AnimatedLink)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--accent-9);
  -webkit-app-region: no-drag;
`

const PageHeading = styled(Heading).attrs({
  size: '4',
})`
  font-weight: 500;
  view-transition-name: heading;
  text-align: center;
`

const fadein = keyframes`
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

function staggerAnimation(keyFrames: Keyframes) {
  const delay = 200 + 100 * staggerIndex

  staggerIndex += 1

  return css`
    animation: 200ms both ${delay}ms ease-in-out ${keyFrames};
  `
}

const StyledPreview = styled(Preview)`
  view-transition-name: preview;
  margin: var(--space-3) 0;
  padding: var(--space-5);
  border: var(--default-border);
  background: var(--gray-1);
`

const TabHeader = styled(Flex).attrs({
  align: 'center',
  justify: 'between',
})`
  background: var(--gray-1);

  .rt-TabsList {
    box-shadow: none;
    height: auto;
  }

  .rt-TabsTriggerInner {
    background: none;
  }

  svg {
    color: var(--gray-10);
    margin-left: calc(0px - var(--space-1));
  }

  button {
    padding: var(--space-2) var(--space-3);
    cursor: pointer;

    &:hover {
      background: var(--gray-4);
    }

    &[data-state='active'] {
      background: var(--gray-5);
    }
  }
`

const Column = styled(Box)`
  width: 50%;
`

const LeftColumn = styled(Column)`
  ${staggerAnimation(fadein)}
`

type CustomFontProps = {
  $font?: string
}

function renderCustomFont(props: CustomFontProps) {
  return {
    style: {
      fontFamily: props.$font,
    },
  }
}

const RightColumn = styled(Column).attrs<CustomFontProps>(renderCustomFont)`
  ${staggerAnimation(fadein)}
`

const ContentHeader = styled(Heading).attrs({
  size: '5',
})`
  margin-bottom: var(--space-3);
  font-weight: 500;
`

const Content = styled(Tabs.Content)`
  display: flex;
  flex-direction: row;
  gap: var(--space-4);

  &[data-state='active'] {
    padding: var(--space-4);
  }
`

const GlyphsContainer = styled(ScrollArea).attrs({
  type: 'hover',
  scrollbars: 'vertical',
})`
  // Header:                  56px
  // Font Select:             57px
  // "Glyphs" Heading:        26px
  // Glyphs Section Padding:  var(--space-4) * 2
  // Footer:                  24px
  height: calc(100vh - (56px + 57px + 26px + (var(--space-4) * 2) + 24px));
`

const TabContent = styled(Box)`
  flex: 1;
`

type Preview = {
  size: number
  text: string
}

export default function Family({ id }: FamilyProps) {
  const { data: family } = useAPI('get.family', [id])
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from')

  const [activeFont, setActiveFont] = useState<Font | undefined>()
  const [activeTab, setActiveTab] = useState<'preview' | 'glyphs'>('preview')
  const [preview, setPreview] = useLocalStorage(
    'preview.markdown.all',
    '# Hello world'
  )

  // con

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'preview' | 'glyphs')
  }

  useEffect(() => {
    if (family != null && activeFont == null) {
      setActiveFont(family.fonts.at(0))
    }
  }, [activeFont, family])

  return (
    <Box>
      <Header>
        {from && (
          <BackLink to={from}>
            <IndexIcon /> Back
          </BackLink>
        )}
        <PageHeading>{family?.name}</PageHeading>
        <div />
      </Header>
      <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
        <TabHeader>
          {/* <Tabs.List>
            {family?.fonts.map((font) => (
              <Tabs.Trigger key={font.id} value={font.id.toString()}>
                {font.style}
                {font.weight ? `:${font.weight}` : ''}
              </Tabs.Trigger>
            ))}
          </Tabs.List> */}
          <Tabs.List>
            <Tabs.Trigger value="preview">
              <PreviewIcon />
              &nbsp;&nbsp;Preview
            </Tabs.Trigger>
            <Tabs.Trigger value="glyphs">
              <GlyphIcon />
              &nbsp;&nbsp;Glyphs
            </Tabs.Trigger>
          </Tabs.List>
          {/* <Text size="2">Style:</Text>
          {family?.fonts && family?.fonts.length > 1 ? (
            <Select.Root
              value={activeFont?.id.toString()}
              onValueChange={handleFontChange}>
              <Select.Trigger />
              <SelectContent>
                {family?.fonts.map((font) => (
                  <Select.Item key={font.id} value={font.id.toString()}>
                    {font.style}
                    {font.weight ? `:${font.weight}` : ''}

                  </Select.Item>
                ))}
              </SelectContent>
            </Select.Root>
          ) : (
            family?.fonts.at(0)?.style
          )} */}
        </TabHeader>
        <TabContent>
          <Content value="preview">
            <LeftColumn>
              <ContentHeader>Preview</ContentHeader>
              <PreviewEditor value={preview} onValueChange={setPreview} />
            </LeftColumn>
            <RightColumn $font={activeFont?.fullName}>
              <Markdown>{preview}</Markdown>
              {/* <StyledPreview
                font={family?.fonts.at(0)}
                size={state['preview.size']}>
                {state['preview.text']}
              </StyledPreview> */}
            </RightColumn>
          </Content>
          <Content value="glyphs">
            <LeftColumn>
              <ContentHeader>Glyphs</ContentHeader>
              <GlyphsContainer>
                <Glyphs data={family?.fonts.at(0)} />
              </GlyphsContainer>
            </LeftColumn>
          </Content>
          {/* {family?.fonts.map((font) => (
            <Content key={font.id} value={font.id.toString()}>
            </Content>
          ))} */}
        </TabContent>
      </Tabs.Root>
    </Box>
  )
}
