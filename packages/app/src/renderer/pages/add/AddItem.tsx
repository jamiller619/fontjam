import { Flex, Heading } from '@radix-ui/themes'
import { FormEvent, Fragment, MouseEvent, useCallback, useState } from 'react'
import { styled } from 'styled-components'
import { LibraryType } from '@shared/types'
import AnimatedLink from '~/components/AnimatedLink'
import Backdrop from '~/components/Backdrop'
import { Button, Textbox } from '~/components/input'
import useAPI from '~/hooks/useAPI'
import useAnimatedNavigate from '~/hooks/useAnimatedNavigate'
import useInputFocus from '~/hooks/useInputFocus'
import { toTitleCase } from '~/utils/string'

type AddItemProps = {
  type: LibraryType
}

const Container = styled(Flex)`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  align-items: center;
  justify-content: center;
`

const Window = styled(Flex)`
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background-color: var(--gray-2);
  border-radius: var(--radius-4);
  padding: var(--space-6) var(--space-9);

  .rt-Heading {
    font-weight: 600;
    align-self: start;
  }
`

const Form = styled('form')`
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  flex-direction: column;
  margin-top: var(--space-3);
`

const ButtonGroupContainer = styled(Flex)`
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  gap: var(--space-2);

  > * {
    flex: 1;
  }
`

export default function AddItem({ type }: AddItemProps) {
  const name = toTitleCase(type)
  const ref = useInputFocus()
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const navigate = useAnimatedNavigate()
  const { mutate } = useAPI('get.libraries')

  const handleAddFolder = useCallback(async (e: MouseEvent) => {
    e.preventDefault()

    const result = await window.api['choose.directory']()

    if (result) setSelectedFolder(result)
  }, [])

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      if (!ref.current?.value || !selectedFolder) {
        return
      }

      await window.api['create.library']({
        createdAt: Date.now(),
        icon: 'AccessTime20Filled',
        isEditable: 1,
        name: ref.current.value,
        path: selectedFolder,
        type: 'local',
      })

      await mutate()

      navigate('/')
    },
    [mutate, navigate, ref, selectedFolder]
  )

  return (
    <Fragment>
      <Backdrop />
      <Container>
        <Window>
          <Heading size="5" m="2">
            Add {name}
          </Heading>
          <Form onSubmit={handleSubmit}>
            <Textbox placeholder={`${name} name`} ref={ref} />
            <Button onClick={handleAddFolder}>
              {selectedFolder ?? 'Choose folder...'}
            </Button>
            <ButtonGroupContainer>
              <Button.Link asChild>
                <AnimatedLink to="/">Cancel</AnimatedLink>
              </Button.Link>
              <Button.Primary>Add {name}</Button.Primary>
            </ButtonGroupContainer>
          </Form>
        </Window>
      </Container>
    </Fragment>
  )
}
