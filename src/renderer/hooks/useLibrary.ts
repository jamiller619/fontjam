import { useEffect } from 'react'
import { useIsMounted, useSessionStorage } from 'usehooks-ts'
import { Family, Library, Page } from '@shared/types'

export function useFontFamilies(
  libraryId: number,
  page: Page = { index: 0, length: 48 }
) {
  // Antipattern, sure. But Electron doesn't implement an
  // AbortController for IPC, so we don't have a choice...
  const isMounted = useIsMounted()
  const library = useLibrary(libraryId)
  const key = `library.${libraryId}.fonts`
  const [families, setFamilies] = useSessionStorage<Family[]>(key, [])

  useEffect(() => {
    if (families.length > 0) return

    window.api['get.fonts'](libraryId, page).then((response) => {
      if (isMounted()) setFamilies(response.records)
    })
  }, [families.length, isMounted, libraryId, page, setFamilies])

  return { families, library } as const
}

export default function useLibrary(id: number) {
  const libraries = useLibraries()

  return libraries.find((library) => library.id === id)
}

export function useLibraries() {
  const [libraries, setLibraries] = useSessionStorage<Library[]>(
    `libraries`,
    []
  )

  useEffect(() => {
    if (libraries.length > 0) return

    window.api['get.libraries']().then(setLibraries)
  })

  return libraries
}
