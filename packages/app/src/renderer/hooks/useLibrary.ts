import { useEffect } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import { FontFamily, Library, Page, Sort } from '@shared/types'
import api from '~/utils/api'
import useAPI from './useAPI'
import useAppState from './useAppState'

export type LibraryWithDefaultSort = Library & {
  defaultSort: Sort<FontFamily>
}

const DEFAULT_SORT: Sort<FontFamily> = {
  col: 'name',
  dir: 'asc',
}

const librarySortDefaults: Record<string, Sort<FontFamily>> = {
  'Google Fonts': {
    col: 'popularity',
    dir: 'asc',
  },
  'Recently Added': {
    col: 'createdAt',
    dir: 'desc',
  },
}

function resolveDefaultSort(library: Library): Sort<FontFamily> {
  if (librarySortDefaults[library.name]) {
    return librarySortDefaults[library.name]
  }

  return DEFAULT_SORT
}

export function useLibraries() {
  const [libraries, setLibraries] = useSessionStorage<LibraryWithDefaultSort[]>(
    'libraries',
    []
  )

  useEffect(() => {
    if (libraries.length > 0) return

    api.call('get.libraries').then((libraries) => {
      const mapped = libraries.map((library) => ({
        ...library,
        defaultSort: resolveDefaultSort(library),
      }))

      setLibraries(mapped)
    })
  }, [libraries.length, setLibraries])

  return libraries
}

function parseId(id?: string | number | null) {
  if (id == null) return undefined
  if (typeof id === 'number') return id

  return Number(id)
}

export function useLibrary(id?: string | number | null) {
  const libraries = useLibraries()
  const nid = parseId(id)

  return libraries.find((l) => l.id === nid)
}

const PAGE_SIZE = 36

export function useFamilies(
  libraryId: number,
  page?: Page,
  sort?: Sort<FontFamily>
) {
  const library = useLibrary(libraryId)
  const resolvedPage = page ?? { index: 0, length: PAGE_SIZE }
  const resolvedSort = sort ?? library?.defaultSort ?? DEFAULT_SORT

  const { data, mutate, error, isLoading } = useAPI('get.families', [
    libraryId,
    resolvedPage,
    resolvedSort,
  ])
  const [state, setState] = useAppState()

  useEffect(() => {
    if (libraryId !== state['library.active.id']) {
      setState((prev) => ({
        ...prev,
        'library.active.id': libraryId,
      }))
    }
  }, [libraryId, setState, state])

  return { data, mutate, error, isLoading }
}
