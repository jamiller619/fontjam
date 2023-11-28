import { useEffect } from 'react'
import { useSessionStorage } from 'usehooks-ts'
import { Library } from '@shared/types'
import api from '~/utils/api'
import useAPI from './useAPI'
import useAppState from './useAppState'

export function useLibraries() {
  const [libraries, setLibraries] = useSessionStorage<Library[]>(
    'libraries',
    []
  )

  useEffect(() => {
    if (libraries.length > 0) return

    api.call('get.libraries').then(setLibraries)
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

export function useFamilies(page = 0, pageSize: number, id: number) {
  const { data } = useAPI('get.families', [
    id,
    { index: page, length: pageSize },
  ])
  const [state, setState] = useAppState()

  useEffect(() => {
    if (id !== state['library.active.id']) {
      setState((prev) => ({
        ...prev,
        'library.active.id': id,
      }))
    }
  }, [id, setState, state])

  return data
}
