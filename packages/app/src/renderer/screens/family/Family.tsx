import {
  TextFont16Filled as GlyphIcon,
  ChevronLeft20Filled as IndexIcon,
  PreviewLink16Regular as PreviewIcon,
} from '@fluentui/react-icons'
import { Box, Flex, Heading, Tabs } from '@radix-ui/themes'
import { useEffect, useState } from 'react'
import Markdown from 'react-markdown'
import { useSearchParams } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import type { Keyframes } from 'styled-components/dist/types'
import { useLocalStorage } from 'usehooks-ts'
import { Font } from '@shared/types/dto'
import AnimatedLink from '~/components/AnimatedLink'
import useAPI from '~/hooks/useAPI'
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

// const StyledPreview = styled(Preview)`
//   view-transition-name: preview;
//   margin: var(--space-3) 0;
//   padding: var(--space-5);
//   border: var(--default-border);
//   background: var(--gray-1);
// `

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

const SingleColumn = styled(Box)`
  ${staggerAnimation(fadein)}
  width: 100%;
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

const TabContent = styled(Box)`
  height: calc(100vh - 125px);
  overflow-y: auto;
  overflow-x: hidden;
`

const TabsList = styled(Tabs.List)`
  svg {
    padding-right: var(--space-1);
  }
`

export default function Family({ id }: FamilyProps) {
  const { data: family } = useAPI('get.family', [id])
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from')

  const [activeFont, setActiveFont] = useState<Font | undefined>()
  const [activeTab, setActiveTab] = useState<'preview' | 'glyphs'>('preview')
  const [preview, setPreview] = useLocalStorage(
    'preview.markdown.all',
    '# Hello world',
  )

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
          <TabsList>
            <Tabs.Trigger value="preview">
              <PreviewIcon /> Preview
            </Tabs.Trigger>
            <Tabs.Trigger value="glyphs">
              <GlyphIcon /> Glyphs
            </Tabs.Trigger>
            <Tabs.Trigger value="meta">
              <GlyphIcon /> Meta
            </Tabs.Trigger>
          </TabsList>
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
            <SingleColumn>
              <ContentHeader>Glyphs</ContentHeader>
              <Glyphs
                data={family?.fonts.at(0)}
                postscriptFamilyName={family?.postscriptFamilyName}
              />
            </SingleColumn>
          </Content>
          {/* {family?.fonts.map((font) => (
            <Content key={font.id} value={font.id.toString()}>
            </Content>
          ))} */}
          <Content value="meta">
            <LeftColumn>
              <pre>{JSON.stringify(family, null, 2)}</pre>
              <pre>{JSON.stringify(family?.fonts.at(0), null, 2)}</pre>
            </LeftColumn>
          </Content>
        </TabContent>
      </Tabs.Root>
    </Box>
  )
}
