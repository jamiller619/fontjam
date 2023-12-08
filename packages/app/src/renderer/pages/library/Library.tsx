import { Fragment, useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import useDragNDrop from '~/components/dnd/useDragNDrop'
import { useFamilies } from '~/hooks/useLibrary'
import Grid from './Grid'
import Header from './Header'

type LibraryProps = {
  id: number
}

async function handleFileDrop(files: FileList) {
  if (!files) return

  const paths: string[] = []

  for (const file of files) {
    paths.push(file.path)
  }

  await window.api['install.fonts'](...paths)
}

export default function Library({ id }: LibraryProps) {
  const { ref: pageRef } = useInView({
    threshold: 0,
  })
  const scrollRef = useRef(null)
  const { data, mutate } = useFamilies(id)

  useDragNDrop({
    onFileDrop: handleFileDrop,
  })

  useEffect(() => {
    window.api.on('library.loaded', (library) => {
      if (id === library.id) {
        console.log(`Attempting to update library "${library.name}"`)

        mutate()
      }
    })

    return () => {
      window.api.off('library.loaded')
    }
  }, [id, mutate])

  return (
    <Fragment>
      <Header />
      <Grid data={data?.records} ref={scrollRef}>
        <div ref={pageRef} />
      </Grid>
    </Fragment>
  )
}
