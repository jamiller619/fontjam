import { ChevronLeft20Filled as IndexIcon } from '@fluentui/react-icons'
import {
  Box,
  Flex,
  Heading,
  ScrollArea,
  Select,
  Tabs,
  Text,
} from '@radix-ui/themes'
import { ChangeEvent, Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import AnimatedLink from '~/components/AnimatedLink'
import Backdrop from '~/components/Backdrop'
import Preview from '~/components/Preview'
import { Textbox } from '~/components/input'
import useAPI from '~/hooks/useAPI'
import useFontData from '~/hooks/useFontData'
import Glyphs from './Glyphs'

const Container = styled(Flex)`
  flex-direction: column;
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
  margin: var(--space-4) 0;
  font-weight: 600;
  view-transition-name: heading;
`

const Header = styled(Flex)`
  align-items: end;
  justify-content: space-between;
  border-bottom: 1px solid var(--gray-7);
`

const TabsList = styled(Tabs.List)`
  box-shadow: none;
  margin-bottom: -1px;
`

const ContentBox = styled(ScrollArea).attrs({
  scrollbars: 'vertical',
})<{ $vtName?: string }>`
  height: 65vh;
  view-transition-name: ${({ $vtName }) => $vtName ?? ''};
  padding: var(--space-4) 0;
`

const Content = styled(Tabs.Content)`
  display: flex;
  gap: var(--space-4);

  ${ContentBox} {
    flex: 1;
  }
`

type Preview = {
  size: number
  text: string
}

export default function Family() {
  const { name, id } = useParams()
  const { data: family } = useAPI('get.family', [Number(id), name], {
    refreshWhenHidden: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const [activeFont, setActiveFont] = useState<string | undefined>(
    family?.fonts.at(0)?.fullName
  )
  const [preview, setPreview] = useState<Preview>({
    size: 32,
    text: 'The quick brown fox jumps over the lazy dog',
  })

  const handlePreviewTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPreview((prev) => ({ ...prev, text: e.target.value }))
  }

  const fontData = useFontData(
    family?.fonts.find((f) => f.fullName === activeFont)
  )

  useEffect(() => {
    if (activeFont != null || family == null) return

    setActiveFont(family.fonts.at(0)!.fullName)
  }, [activeFont, family])

  return (
    <Fragment>
      <Backdrop />
      <Container>
        <BackLink to={`/library/${id}`}>
          <IndexIcon /> Back
        </BackLink>
        <Tabs.Root value={activeFont} onValueChange={setActiveFont}>
          <Header>
            <PageHeading>{family?.name}</PageHeading>
            <TabsList>
              {(family?.fonts.length ?? 0) > 4 ? (
                <Select.Root value={activeFont} onValueChange={setActiveFont}>
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
                  <Text>Preview</Text>
                  <Textbox
                    value={preview.text}
                    onChange={handlePreviewTextChange}
                  />
                  <Preview id={font.id} name={font.fullName} size={36}>
                    {preview.text}
                  </Preview>
                </ContentBox>
                <ContentBox>
                  <Text>Glyphs</Text>
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
